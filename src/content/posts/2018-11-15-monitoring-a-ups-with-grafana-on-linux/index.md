---
title: "Grafana Series Part 2: Monitoring a UPS with Grafana on Linux"
date: 2018-11-15T20:30:00Z
author: IronicBadger
tags:
  - linux
  - grafana series
  - grafana
  - ups
hero: ./featured.jpg
---

I recently purchased a new UPS which has a USB interface, the [APC BX1500M](https://www.apc.com/shop/us/en/products/APC-Back-UPS-Pro-BX1500M-Compact-Tower-1500VA-AVR-LCD-120V/P-BX1500M) to be precise. After piecing together a few blog posts I had a working Grafana dashboard giving me information about the power consumption of the devices connected to the UPS. Nice. 

- [Part 1: Setting up InfluxDB, Grafana and Telegraf with Docker on Linux](https://blog.linuxserver.io/2017/11/25/how-to-monitor-your-server-using-grafana-influxdb-and-telegraf/)
- **Part 2: Monitoring a UPS with Grafana on Linux**
- Part 3: Grafana integration with 3rd party services such as Nest and weather.com - *coming soon*

If you followed Part 1 of this series you'll already have Grafana and InfluxDB setup and working. I will assume that you have this for the rest of this guide. 

> A big thanks in particular goes to @MariusGilberg for the awesome Grafana dashboard used in this article via [this post on his blog](https://technicalramblings.com/blog/setting-grafana-influxdb-telegraf-ups-monitoring-unraid/). Also to Viaduct (unraid forums) for writing the PHP script used.

---

## Debian Linux Host Setup

As you know by now I use Debian to run the '[Perfect Media Server](https://blog.linuxserver.io/2017/06/24/the-perfect-media-server-2017/)' and therefore this guide will be applicable to Debian hosts but easily adapted for other Linux OSs.

I assume you have connected the UPS to a free USB port on your motherboard and it shows up using `lsusb` thus:

    Bus 002 Device 003: ID 051d:0002 American Power Conversion Uninterruptible Power Supply
    

On Debian install the required APC UPS daemon and PHP packages with:

    apt install apcupsd php -y

Once installed stop the `apcupsd` service if it started automatically with

    systemctl stop apcupsd

You'll next need to edit the configuration file for the service which lives at `/etc/apcupsd/apcupsd.conf`. If you'd like enter a `UPSNAME` that makes sense (mine looked like `UPSNAME awesomo`). Then the default version of this file on my system had a line that looked like `DEVICE /tty/xxx0`, comment out or delete this line and restart the service with:

    systemctl start apcupsd
    systemctl status apcupsd

If everything looks good in status you should now be able to run

    root@awesomo:~# apcaccess
    APC      : 001,036,0874
    DATE     : 2018-11-14 20:53:55 -0500  
    HOSTNAME : awesomo
    VERSION  : 3.14.14 (31 May 2016) debian
    UPSNAME  : awesomo
    CABLE    : USB Cable
    DRIVER   : USB UPS Driver
    UPSMODE  : Stand Alone
    STARTTIME: 2018-11-14 20:53:54 -0500  
    MODEL    : Back-UPS XS 1500M 
    STATUS   : ONLINE 
    LINEV    : 119.0 Volts
    LOADPCT  : 34.0 Percent
    BCHARGE  : 100.0 Percent
    TIMELEFT : 17.2 Minutes
    MBATTCHG : 5 Percent
    MINTIMEL : 3 Minutes
    MAXTIME  : 0 Seconds
    SENSE    : Medium
    LOTRANS  : 88.0 Volts
    HITRANS  : 139.0 Volts
    ALARMDEL : 30 Seconds
    BATTV    : 27.3 Volts
    LASTXFER : Unacceptable line voltage changes
    NUMXFERS : 0
    TONBATT  : 0 Seconds
    CUMONBATT: 0 Seconds
    XOFFBATT : N/A
    SELFTEST : NO
    STATFLAG : 0x05000008
    SERIALNO : 3B1828X67626  
    BATTDATE : 2018-07-13
    NOMINV   : 120 Volts
    NOMBATTV : 24.0 Volts
    NOMPOWER : 900 Watts
    FIRMWARE : 947.d7 .D USB FW:d7
    END APC  : 2018-11-14 20:54:04 -0500 

If you see this output, you've completed the UPS / host setup.

## InfluxDB Setup

Whether you're creating an InfluxDB setup just for this purpose or you're tacking onto an existing instance I'd suggest putting all the data from your UPS into a separate database.

First, we'll need to create it and can do so using `curl`:

    curl -i -XPOST  "http://localhost:8086/query?q=CREATE+DATABASE+ups"

We can verify successful DB creation again using `curl`:

    alex@cartman:~$ curl -i -XPOST  "http://localhost:8086/query?q=SHOW+DATABASES"
    HTTP/1.1 200 OK
    Content-Type: application/json
    Request-Id: 2fd65ad1-e87a-11e8-8009-0242ac120008
    X-Influxdb-Build: OSS
    X-Influxdb-Version: 1.7.0
    X-Request-Id: 2fd65ad1-e87a-11e8-8009-0242ac120008
    Date: Thu, 15 Nov 2018 02:00:12 GMT
    Transfer-Encoding: chunked
    
    {"results":[{"statement_id":0,"series":[{"name":"databases","columns":["name"],"values":[["_internal"],["ups"]]}]}]}
    

Note that final entry is `ups` which is the database we just created. Now we have to move onto scraping the output the UPS generates and write it to the database.

## Scraping the UPS output

The following script is PHP based and was written by *Viaduct* over on the unraid forums.

Note the section near the top `tagsArray` and compare the items in the array being scraped against the actual output of `apcacess` as shown above. Pick and choose the items you want and these are what will be written to the database. The name *must match exactly* else the scraping will fail.

You will also need to modify, near the bottom, your InfluxDB IP. You needed this above for the `curl` commands.

    #!/usr/bin/php
    <?php
    
    $command = "apcaccess";
    $args = "status";
    $tagsArray = array(
    "LOADPCT", 
    "BATTV", 
    "TIMELEFT", 
    "BCHARGE"
    );
    
    //do system call
    
    $call = $command." ".$args;
    $output = shell_exec($call);
    
    //parse output for tag and value
    
    foreach ($tagsArray as $tag) {
    
    preg_match("/".$tag."\s*:\s([\d|\.]+)/si", $output, $match);
    
    //send measurement, tag and value to influx
    
    sendDB($match[1], $tag);
    
    }
    //end system call
    
    
    //send to influxdb
    
    function sendDB($val, $tagname) {
    
    $curl = "curl -i -XPOST 'http://influxDBIP:8086/write?db=ups' --data-binary 'APC,host=awesomo ".$tagname."=".$val."'";
    $execsr = exec($curl);
    
    }
    
    ?>

Save the script somewhere on your filesystem and make it executable `chmod +x /opt/scrape.php`. You can do a test run with `/opt/scrape.php` and then verify your InfluxDB logs and look for some successful writes via curl (code 204 = good).

    2018-11-15T02:11:16.965547498Z [httpd] 192.168.1.250 - - [15/Nov/2018:02:11:16 +0000] "POST /write?db=ups HTTP/1.1" 204 0 "-" "curl/7.52.1" bc1826d1-e87b-11e8-800a-0242ac120008 53295
    2018-11-15T02:11:16.990611179Z [httpd] 192.168.1.250 - - [15/Nov/2018:02:11:16 +0000] "POST /write?db=ups HTTP/1.1" 204 0 "-" "curl/7.52.1" bc2193c2-e87b-11e8-800b-0242ac120008 16600
    2018-11-15T02:11:17.014354572Z [httpd] 192.168.1.250 - - [15/Nov/2018:02:11:16 +0000] "POST /write?db=ups HTTP/1.1" 204 0 "-" "curl/7.52.1" bc253e9c-e87b-11e8-800c-0242ac120008 16297
    2018-11-15T02:11:17.042864060Z [httpd] 192.168.1.250 - - [15/Nov/2018:02:11:17 +0000] "POST /write?db=ups HTTP/1.1" 204 0 "-" "curl/7.52.1" bc28ca91-e87b-11e8-800d-0242ac120008 215

## Automating the scraping

We'll use `cron` for automating the running of the scraping script. Do not edit the crontab with `crontab -e` instead you must edit `/etc/crontab` and specify a user in order for this work.

Add the following line to `/etc/crontab` - this will run the scraping script every minute. Modify to suit your needs.

    * * * * * root /usr/bin/php /opt/scrape.php >/dev/null 2>&1

Again verify the InfluxDB logs for 204 response codes to check everything went OK.

## Grafana Dashboard

The next step is to add a data source in Grafana. Under the configuration menu in Grafana click "Add data source".
![](/content/images/2018/11/Screenshot-from-2018-11-14-21-30-39.png)
Modify the `Name`, `Type = InfluxDB`, `URL = http://influxdb:8086`, `Database = ups`, `User = root`, `Pass = root`. If you modified these values obviously modify to suit.

Then hit save & test. 

Next in Grafana click the + icon on the left and select 'import'. We'll be importing [this awesome dashboard](https://grafana.com/dashboards/7197)by Marius Gilberg. The ID you need is `7197`.

Select your Influx UPS data source as the new data source we just created above and hit import.

BOOM! That's it.
![](/content/images/2018/11/Screenshot-from-2018-11-14-21-35-24.png)
Note in the top left you can dynamically configure this dashboard based on your currency, UPS capacity and kWh price. Fantastic stuff by Marius, thanks a lot!!

That's it. We're done here. Thanks for reading.
