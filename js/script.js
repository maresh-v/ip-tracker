class IpTracker{
    constructor(searchField, searchButton, outputIP, outputLocation, outputTimezone, outputProvider, mapWrapper, mobileOutputToggle){
        this.searchField = searchField;
        this.searchButton = searchButton;
        this.outputIP = outputIP;
        this.outputLocation = outputLocation;
        this.outputTimezone = outputTimezone;
        this.outputProvider = outputProvider;
        this.mapWrapper = mapWrapper;
        this.mobileOutputToggle = mobileOutputToggle;
        this.maxMobileWidth = 580;

        this.ipifyHeader = {'Access-Control-Allow-Origin' : 'geo.ipify.org'};
        this.ipifyURL = 'https://geo.ipify.org/api/v2/country,city?apiKey=at_QtheOM5HcpScojkmVgxwgdZxoAbhD&ipAddress='

        this.ip = this.lat = this.lng = this.address = this.timezone = this.isp = ""

        this.searchButton.addEventListener("click", () => {
            this.fetchAddressData();
        });
    }

    fetchAddressData = () => { 
        this.ip = this.searchField.value;
        fetch(`${this.ipifyURL}${this.ip}`, {
            header: this.ipifyHeader})
            .then((response) => response.json())
            .then(data => {
                this.lat = data.location.lat;
                this.lng = data.location.lng;
                this.address = `${data.location.city}, ${data.location.country} ${data.location.postalCode}`;
                this.timezone = data.location.timezone;
                this.isp = data.isp;
                this.ip = data.ip;
                this.displayResult();
                ipMap.redrawMap(this.lat, this.lng, 10);
            })
            .catch(err => this.alertError(err));
    }

    displayResult(){
        this.outputIP.innerText = this.ip;
        this.outputLocation.innerText = this.address;
        this.outputTimezone.innerText = this.timezone;
        this.outputProvider.innerText = this.isp;
        this.address = this.timezone = this.isp = "";
    }

    alertError(error){
        if(error.message.search('NetworkError') !== -1){
            alert("You probably have the ad blocker plug-in turned on. Please turn it off for the IP tracker to work properly.")
        }else if(error.message.search('data.location') !== -1){
            alert("Invalid IP Address");
        }else{
            console.error(`Caught Error: ${error.message}`);
        }
    }
}

class Map{
    constructor(mapWrapper){
        this.mapWrapper = mapWrapper;
        this.defaultLat = 30;
        this.defaultLng = -30;

        this.center = SMap.Coords.fromWGS84(this.defaultLng, this.defaultLng); /* default */
        this.map = new SMap(mapWrapper, this.center, 4, 1);
        this.map.addDefaultLayer(SMap.DEF_BASE).enable();

        this.mouseControlPan = new SMap.Control.Mouse(SMap.MOUSE_PAN);
        this.mouseControlZoom = new SMap.Control.Mouse(SMap.MOUSE_ZOOM);
        this.mouseControlWheel = new SMap.Control.Mouse(SMap.MOUSE_WHEEL);

        this.map.addControl(this.mouseControlPan);
        this.map.addControl(this.mouseControlZoom);
        this.map.addControl(this.mouseControlWheel);

        this.map.setCursor("move");
        this.syncSize = new SMap.Control.Sync({bottomSpace: 0});
        this.map.addControl(this.syncSize);
    }


    redrawMap = (lat, lng, zoom) => {
        this.center = SMap.Coords.fromWGS84(lng, lat);
        this.map.setCenter(this.center, true);
        this.map.setZoom(zoom,false,true);

        let markerLayer = new SMap.Layer.Marker;
        this.map.addLayer(markerLayer);
        markerLayer.enable();
        let marker = new SMap.Marker(this.center,  null, {url:'images/icon-location.svg', anchor: {left:25,top:55}});
        markerLayer.addMarker(marker);
    
        if(window.innerWidth <= this.maxMobileWidth){
            let pxPosition = this.center.toPixel(this.map);
            pxPosition.minus(new SMap.Pixel(0, 1.5));
    
            let mobileCenter = pxPosition.toCoords(this.map);
            this.map.setCenter(mobileCenter);
        }
    }
}

const searchField = document.querySelector('[data-ip-tracker-role="search-field"]');
const searchButton = document.querySelector('[data-ip-tracker-role="search-button"]');
const outputIP = document.querySelector('[data-ip-tracker-role="output-ip"]');
const outputLocation = document.querySelector('[data-ip-tracker-role="output-location"]');
const outputTimezone = document.querySelector('[data-ip-tracker-role="output-timezone"]');
const outputProvider = document.querySelector('[data-ip-tracker-role="output-provider"]');
const mobileOutputToggle = document.querySelector('.address-tracker__output::after');

const mapWrapper = document.querySelector('[data-ip-tracker-role="map"]');

const ipTracker = new IpTracker(searchField, searchButton, outputIP, outputLocation, outputTimezone, outputProvider, mapWrapper, mobileOutputToggle);
const ipMap = new Map(mapWrapper);

window.addEventListener(('keyup'), e => {
    if(e.key == 'Enter'){
        searchButton.click();
    }
});