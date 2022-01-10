$(function () {
    var $select;
    var btnR = document.querySelector("#regionBtn");
    var btnM = document.querySelector("#makeBtn");
    let selectedRegion = 0;
    
    $.each(json, function (x, obj) {
      if (obj.rValue == "region") {
        $select = $("#region");
      }
    });
    $.each(json, function (x, dataObj) {
      var option = '<option value="' + dataObj.rValue + '">' + dataObj.region + "</option>";
      $select.append(option);
    });
  
    function searchMake() {
      selectedRegion = $select[0].selectedIndex;
      const make = json[selectedRegion].make
      
      $.each(make, function (x, obj) {
        if (obj.mValue == "make") {
          $select = $("#make");
        }
      });
  
      $.each(make, function (x, dataObj) {
        var option = '<option value="' + dataObj.mValue + '">' + dataObj.make + "</option>";
        $select.append(option);
      });
    }
  
    function searchModel() {
      const selectedIndex = $select[0].selectedIndex;
      const model = json[selectedRegion].make[selectedIndex].model
      
      $.each(model, function (x, obj) {
        if (obj.mValue == "model") {
          $select = $("#model");
        }
      });
  
      $.each(model, function (x, dataObj) {
        var option = '<option value="' + dataObj.mValue + '">' + dataObj.model + "</option>";
        $select.append(option);
      });
    }
  
    btnR.addEventListener("click", searchMake);
    btnM.addEventListener("click", searchModel);
  });
  
  var json = [
    
    {
      "region": "Francja",
      "rValue": "region",
      "makes": [{
          "make": "Pegout",
          "mValue":"make",
          "model": [
            {
              "model": "208 1.2 PureTech",
              "mValue": "model",
            },
          ]
        },
        {
          "make":"Renaut",
          "mValue":"make",
          "model":{
              "model":"Twingo 1.0 Sce",
              "mValue": "model",
            },
            {
              "model":"Clio 1.0 Tsc",
              "mValue": "model",
            }, 
          ]
        }
      ]
    },
    {
      "region": "Korea",
      "rValue": "region",
      "make":[
        {
          "make":"Hyundai",
          "mValue":"make",
          "model":{
            {
              "model":"Tucson IV, 1.6 CRDI",
              "mValue":"model",
            },
         {
          "make":"Kia",
          "mValue":"make",
          "model":{
            },
            {
              "model":"Rio 1,25 CVVT",
              "mValue": "model",
            }
          ]
        },
      ]
    },
    {
      "region": "Niemcy",
      "rValue": "region",
      "Volkswagen":[
        {
          "make";"Volkswagen",
          "mValue":"make",
          "make":[
            {
              "model":"Golf VII 1,6 TDI",
              "mValue": "model",
            },
            {
              "model":"ID. 3 53 kWh",
              "mValue": "model",
            },
            {
              "model":"Polo VI 1.0 TSI",
              "mValue": "model",
            }
          ]
        },
        {
          "make":"Seat",
          "mValue":"make",
          "model":[
            {
              "model":"Arona 1.0 TSI",
              "mValue": "model",
            },
          ]
        }
      ]
    }
  ];