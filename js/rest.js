var SERVER_URL = "http://o2g-instance1.ale-aapp.com:80/api/rest/";
var SERVER_URL_HTTPS = "https://o2g-instance1.ale-aapp.com:8443/api/rest";
var SERVER_IP = "o2g-instance1.ale-aapp.com";
var serverUrl = "https://" + SERVER_IP + ":443/api/rest/";
var login = "adminC7";
var password = "admin@7C7";


function doAuthent(pbxAction) {
    console.log("doAuthent - begin");

    var authRq = new XMLHttpRequest();

    authRq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                console.log(authRq);
                startSession(pbxAction);
            }
        }
    };

    authRq.open("GET", serverUrl + "authenticate?version=1.0", true, login, password);
    authRq.withCredentials = true;
    authRq.send();

    console.log("doAuthent - end");
}

function startSession(pbxAction) {
    var sessionRq = new XMLHttpRequest();

    var appliNameParams = { "applicationName": "TelephonyExtension" };

    sessionRq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                console.log(sessionRq);
                pbxAction();
            }
        }
    }

    sessionRq.open("POST", serverUrl + "1.0/sessions");
    sessionRq.setRequestHeader('Content-Type', "application/json");
    sessionRq.setRequestHeader('Accept', "*/*");
    sessionRq.send(JSON.stringify(appliNameParams));
}

function closeSession(pbxAction) {
    var sessionCloseRq = new XMLHttpRequest();
    sessionCloseRq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            console.log(sessionCloseRq);
            doAuthent(pbxAction);
        }
    }
    sessionCloseRq.open("DELETE", serverUrl + "1.0/sessions");
    sessionCloseRq.send();
}

function request(urlEnd, method, onSuccess, parametersToSend) {

    console.log("request - begin - " + urlEnd);

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function (err) {
        if (this.readyState === XMLHttpRequest.DONE) {
            console.log(xhr);

            if (xhr != null && xhr.response != null) {
                try {
                    onSuccess(JSON.parse(xhr.response));
                }
                catch (e) {
                    onSuccess(xhr.response);
                }
            }
        }
    }

    if (method !== "POST" && method !== "PUT" && method !== "DELETE") {
        xhr.open("GET", serverUrl + "1.0" + urlEnd);
    }
    else {
        xhr.open(method, serverUrl + "1.0" + urlEnd);
    }

    xhr.setRequestHeader('Content-Type', "application/json");
    xhr.setRequestHeader('Accept', "*/*");
    if (parametersToSend === undefined) {
        xhr.send();
    }
    else {
        xhr.send(parametersToSend);
    }

    console.log("request - end - " + urlEnd);
}

function pbxList() {

    request("/pbxs/", "GET", function (nodes) {


        if (nodes !== null && nodes.nodeIds !== null) {
            var nodeIds = nodes.nodeIds;

            document.getElementById("pbxList").innerHTML = "";

            nodeIds.forEach(function (nodeId, index) {

                request("/pbxs/" + nodeId, "GET", function addOxe(node) {

                    if (index === 0) {
                        document.getElementById("pbxList").innerHTML += "<option value='" + nodeId + "' selected>" + node.fqdn + "</option>";
                    }
                    else {
                        document.getElementById("pbxList").innerHTML += "<option value='" + nodeId + "' >" + node.fqdn + "</option>";
                    }


                });
            });

            console.log("nodesIds ", nodeIds, nodeIds.length);

            if (nodeIds.length > 0) {
                document.getElementById("getPbxList").className = "button";
                document.getElementById("getPhoneNumbers").className = "button";
                document.getElementById("getPhoneNumbersPS").className = "button";
                document.getElementById("getFreeRangeLists").className = "button";
                document.getElementById("getPbxList").className = "button";
                document.getElementById("getFreeNumbers").className = "button";
                document.getElementById("createFreeRangeList").className = "button";
                document.getElementById("deleteFreeRangeList").className = "button";
                document.getElementById("createPhoneNumber").className = "button";
            }
        }
    });
}

function getPhoneNumbers() {
    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    request("/pbxs/" + nodeId + "/instances/Subscriber", "GET", function (response) {

        var ids = response.objectIds;

        if (response.objectIds != null) {
            document.getElementById("phoneNumbers").innerHTML = "";
            document.getElementById("phoneNumbersPS").innerHTML = "";

            for (var i = 0; i < response.objectIds.length; i++) {
                if (i == 0) {
                    document.getElementById("phoneNumbers").innerHTML += "<option value='" + response.objectIds[i] + "' selected>" + response.objectIds[i] + "</option>";
                    document.getElementById("phoneNumbersPS").innerHTML += "<option value='" + response.objectIds[i] + "' selected>" + response.objectIds[i] + "</option>";
                }
                else {
                    document.getElementById("phoneNumbers").innerHTML += "<option value='" + response.objectIds[i] + "'>" + response.objectIds[i] + "</option>";
                    document.getElementById("phoneNumbersPS").innerHTML += "<option value='" + response.objectIds[i] + "'>" + response.objectIds[i] + "</option>";
                }
            }

            if(response.objectIds.length > 0)
            {
                document.getElementById("getAllDevices").className = "button";
            }
        }


    });
}

function getAllDevices() {
    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    var user = document.getElementById("phoneNumbersPS").value;
    user = 19160;

    request("/users/oxe" + user + "/devices", "GET", function (response) {

        var ids = response.objectIds;

        if (response.devices != null) {
            document.getElementById("devices").innerHTML = "";

            for (var i = 0; i < response.devices.length; i++) {

                var id = response.devices[i].id;
                var value = id + " (" + response.devices[i].type + ")";

                if (i == 0) {
                    document.getElementById("devices").innerHTML += "<option value='" + id + "' selected>" + value + "</option>";
                }
                else {
                    document.getElementById("devices").innerHTML += "<option value='" + id + "'>" + value + "</option>";
                }
            }

            if (response.devices.length > 0) {
                document.getElementById("getDevice").className = "button";
                document.getElementById("getDeviceDynamicState").className = "button";
                document.getElementById("getDeviceProgrammeableKeys").className = "button";
                getDevice("");
            }
        }


    });
}


function getDevice(info) {
    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    var user = document.getElementById("phoneNumbersPS").value;
    user = 19160;
    var device = document.getElementById("devices").value;

    request("/users/oxe" + user + "/devices/"+device+"/"+info, "GET", function (response) {

        if(info == "")
        {
            document.getElementById("deviceDetails").innerHTML = "<b>Id: </b>" + response.id + " <br>";
            document.getElementById("deviceDetails").innerHTML += "<b>Type: </b>" + response.type + " <br>";
            document.getElementById("deviceDetails").innerHTML += "<b>SubType: </b>" + response.subType + " <br>";
            document.getElementById("deviceDetails").innerHTML += "<b>Label: </b>" + response.label;
            return;
        }

        if(info == "dynamicState")
        {
            document.getElementById("deviceDynamicState").innerHTML = "<b>Lock: </b>" + response.lock + " <br>";
            document.getElementById("deviceDynamicState").innerHTML += "<b>Campon: </b>" + response.campon;
            return;
        }

        if(info == "programmeableKeys")
        {
            var keys = response.pkeys;

            document.getElementById("deviceProgrammeableKeys").innerHTML = "";

            for(var i = 0; i<keys.length; i++)
            {
                document.getElementById("deviceProgrammeableKeys").innerHTML += "<b>Position: </b>" + keys[i].position + " <br>";
                document.getElementById("deviceProgrammeableKeys").innerHTML += "<b>Mnemonic: </b>" + keys[i].mnemonic + " <br>";
                document.getElementById("deviceProgrammeableKeys").innerHTML += "<b>Locked: </b>" + keys[i].locked;

                if(i != keys.length-1)
                {
                    document.getElementById("deviceProgrammeableKeys").innerHTML += " <br><br>";
                }
            }

            
            
            return;
        }

    });
}

function getFreeRangeLists() {
    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    request("/pbxs/" + nodeId + "/instances/System_Parameters/1/Free_Range_List", "GET", function (response) {

        var ids = response.objectIds;

        if (response.objectIds != null) {
            document.getElementById("freeRangeLists").innerHTML = "";

            response.objectIds.sort();

            for (var i = 0; i < response.objectIds.length; i++) {
                if (i == 0) {
                    document.getElementById("freeRangeLists").innerHTML += "<option value='" + response.objectIds[i] + "' selected>" + response.objectIds[i] + "</option>";
                }
                else {
                    document.getElementById("freeRangeLists").innerHTML += "<option value='" + response.objectIds[i] + "'>" + response.objectIds[i] + "</option>";
                }
            }


            if (response.objectIds.length > 0) {
                document.getElementById("getFreeRangeListDetails").className = "button";
                getFreeRangeListDetails();
            }
        }


    });
}

function getFreeRangeListDetails() {
    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    var rangeListId = document.getElementById("freeRangeLists").value;

    request("/pbxs/" + nodeId + "/instances/System_Parameters/1/Free_Range_List/" + rangeListId, "GET", function (response) {

        document.getElementById("freeRangeListDetails").innerHTML = "";

        if (response !== null && response.attributes !== null) {
            for (var i = 0; i < response.attributes.length; i++) {
                document.getElementById("freeRangeListDetails").innerHTML += "<b>" + response.attributes[i].name + "</b>: " + response.attributes[i].value + "<br>";
            }
        }
    });
}

function deleteFreeRangeList() {
    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    var rangeListId = document.getElementById("freeRangeLists").value;

    request("/pbxs/" + nodeId + "/instances/System_Parameters/1/Free_Range_List/" + rangeListId, "DELETE", function (response) {

        document.getElementById("deleteFreeRangeListResult").innerHTML = ": " + response;
        getFreeRangeLists();
    });
}

function getFreeNumbers() {
    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    var rangeListId = document.getElementById("freeRangeLists").value;

    request("/pbxs/" + nodeId + "/instances/System_Parameters/1/Free_Directory_Number", "GET", function (response) {

        document.getElementById("freeNumbers").innerHTML = "";

        if (response !== null && response.objectIds !== null) {
            response.objectIds.sort();
            for (var i = 0; i < response.objectIds.length; i++) {
                if (i === 0) {
                    document.getElementById("freeNumbers").innerHTML += "<option value='" + response.objectIds[i] + "' selected>" + response.objectIds[i] + "</option>";
                }
                else {
                    document.getElementById("freeNumbers").innerHTML += "<option value='" + response.objectIds[i] + "'>" + response.objectIds[i] + "</option>";
                }

            }
        }
    });
}

function createFreeRangeList() {
    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    var rangeName = document.getElementById("rangeName").value;
    var rangeBeginning = document.getElementById("rangeBeginning").value;
    var rangeEnd = document.getElementById("rangeEnd").value;
    var rangeResponseSize = document.getElementById("rangeResponseSize").value;

    console.log(rangeName, rangeBeginning, rangeEnd, rangeResponseSize);

    var attr = {
        "attributes":
        [
            {
                "name": "Name",
                "value": [rangeName]
            },
            {
                "name": "Begin_Range",
                "value": [rangeBeginning]
            },
            {
                "name": "End_Range",
                "value": [rangeEnd]
            }/*,
            {
                "name": "Response_Size",
                "value": [rangeResponseSize]
            }*/
        ]
    };

    request("/pbxs/" + nodeId + "/instances/System_Parameters/1/Free_Range_List", "POST", function (response) {

        console.log("Statuuuuus : ", response);
        if (response === "") {
            console.log("Free range successfully added!");
            getFreeRangeLists();
        }
    }, JSON.stringify(attr));
}

function createPhoneNumber() {
    console.log("createPhoneNumber - begin");

    var nodeId = document.getElementById("pbxList").value;

    if (nodeId === null) {
        console.log("There is no OXE. Nothing to do then.");
        return;
    }

    var phoneNumber = document.getElementById("phoneNumber").value;
    var phoneNumberFirstName = document.getElementById("phoneNumberFirstName").value;
    var phoneNumberLastName = document.getElementById("phoneNumberLastName").value;
    var phoneNumberSetType = document.getElementById("phoneNumberSetType").value;

    console.log(phoneNumber, phoneNumberFirstName, phoneNumberLastName, phoneNumberSetType);

    var attr = {
        "attributes":
        [
            {
                "name": "Directory_Number",
                "value": [phoneNumber]
            },
            {
                "name": "Annu_Name",
                "value": [phoneNumberLastName]
            },
            {
                "name": "Annu_First_Name",
                "value": [phoneNumberFirstName]
            },

            {
                "name": "Station_Type",
                "value": [phoneNumberSetType]
            }
        ]
    };

    request("/pbxs/" + nodeId + "/instances/Subscriber", "POST", function (response) {

        console.log("Statuuuuus : ", response);
        if (response === "") {
            console.log("Free range successfully added!");
            getFreeRangeLists();
        }
    }, JSON.stringify(attr));

    console.log("createPhoneNumber - end");
}


function openTab(cityName) {
    console.log("name: " + cityName);

    var tabcontent = document.getElementsByClassName("tabContent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    var tablinks = document.getElementsByClassName("tabLink");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = "tabLink";
        tablinks[i].style.zIndex = 0;
    }

    document.getElementById(cityName).style.display = "block";
    document.getElementById(cityName + "Link").className = "tabLink active";
    document.getElementById(cityName + "Link").style.zIndex = 1;
} 
