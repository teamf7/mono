{
  "currencies": [
    { "name": "млн. руб.", "code": "MRU" },
    { "name": "руб.", "code": "RUB" },
    { "name": "тыс. руб.", "code": "TRU" },
    { "name": "Доллар США", "code": "USD" },
    { "name": "Евро", "code": "EUR" },
    { "name": "Гривна", "code": "UAH" },
    { "name": "Белорусский рубль", "code": "BYN" }
  ],
  "vats": [
    { "name": "С учетом НДС", "code": "0" },
    { "name": "Без учета НДС", "code": "1" },
    { "name": "НДС не облагается", "code": "2" }
  ],
  "rateDate": "1999/01/01",
  "rates": {
    "MRU": 1000000,
    "RUB": 1,
    "TRU": 1000,
    "USD": 68.79,
    "EUR": 78.32,
    "UAH": 2.51,
    "BYN": 32.2
  },
  "firstSide": [
    {
      "ID": "1305",
      "UF_NAME": "Публичное акционерное общество «Акционерная нефтяная Компания «Башнефть»",
      "UF_SNAME": "ПАО АНК «Башнефть»",
      "UF_M_BSA": "100",
      "UF_M_BSA_DATE": "09.01.2020"
    },
    {
      "ID": "640",
      "UF_NAME": "Публичное акционерное общество «Интер РАО ЕЭС»",
      "UF_SNAME": "ПАО «Интер РАО»",
      "UF_M_BSA": null,
      "UF_M_BSA_DATE": false
    }
  ],
  "redirectUrl": "/",
  "roles": [
    {
      "name": "Агент",
      "code": "agent",
      "opposition": ["printsipal"]
    },
    {
      "name": "Принципал",
      "code": "printsipal",
      "opposition": ["agent"]
    },
    {
      "name": "Профессор",
      "code": "professor",
      "opposition": ["captain", "otsutstvuet"]
    },
    {
      "name": "Поручитель",
      "code": "poruchitel",
      "opposition": ["kreditor"]
    },
    {
      "name": "Кредитор",
      "code": "kreditor"
    },
    {
      "name": "Должник",
      "code": "dolzhnik"
    },
    {
      "name": "Заемщик",
      "code": "zaemshchik"
    },
    {
      "name": "Капитан",
      "code": "captain",
      "opposition": []
    },
    {
      "name": "Продавец",
      "code": "prodavets"
    }
  ],
  "subject": {
    "id": "121",
    "text": "#subject# #wizardConstant_dealAsset#",
    "title": " #wizardConstant_liabilityUSD# #onBehalfOf# \u041e\u043a\u0430\u0437\u0430\u043d\u0438\u0435 \u0443\u0441\u043b\u0443\u0433 \u043f\u043e \u0434\u043e\u0431\u044b\u0447\u0435 \u043d\u0435\u0444\u0442\u0438, \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u043a\u043e\u043d\u0434\u0435\u043d\u0441\u0430\u043d\u0442\u0430, \u043f\u0440\u0438\u0440\u043e\u0434\u043d\u043e\u0433\u043e \u0438 \u043f\u043e\u043f\u0443\u0442\u043d\u043e\u0433\u043e \u0433\u0430\u0437\u0430",
    "paramValues": [],
    "params": {
      "subject": {
        "type": "ul-custom",
        "description": "Услуги по разработке месторождений",
        "elementSelect": "checkbox",
        "list": {
          "default": [
            {
              "title": "Sumstuff",
              "text": "#reward1# #reward2#",
              "source": {
                "reward1": {
                  "type": "numberUnit",
                  "description": "Тест валют",
                  "url": "unit_text.json?",
                  "units": {
                    "options": [
                      {
                        "type": "ref",
                        "source": "parent.wizardConstant_currencyData"
                      }
                    ]
                  }
                },
                "reward2": {
                  "type": "numberUnit",
                  "description": "Тест валют 2",
                  "url": "unit_text.json?",
                  "units": {
                    "options": [
                      {
                        "type": "ref",
                        "source": "parent.wizardConstant_currencyData"
                      }
                    ]
                  }
                }
              }
            },
            {
              "title": "геологоразведочные работы на шельфе",
              "text": "по организации выполнения следующих геологоразведочных работ на лицензионных участках #parent.sides.role2#: <br> #services#",
              "source": {
                "services": {
                  "type": "ul-collapsed",
                  "description": "вид работ",
                  "source": {
                    "type": "input",
                    "description": "вид работ"
                  },
                  "list": {
                    "default": [
                      {
                        "text": "#value#"
                      }
                    ],
                    "generic": {
                      "text": "#value#"
                    }
                  }
                }
              }
            },
            {
              "title": "организация разработки",
              "text": "по организации разработки: <br> - Интегрированного проекта развития региона месторождений #parent.sides.role2# на территории деятельности #domain#;<br>#developments#",
              "source": {
                "domain": {
                  "type": "input",
                  "description": "территория деятельности"
                },
                "developments": {
                  "type": "ul-custom",
                  "elementSelect": "none",
                  "list": {
                    "default": [],
                    "generic": {
                      "text": "- интегрированного проекта разработки #development#",
                      "source": {
                        "development": {
                          "description": "наименование месторождения",
                          "type": "input"
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              "title": "организация ликвидации скважин",
              "text": "по организации ликвидации и консервации #count# скважин",
              "source": {
                "count": {
                  "type": "input",
                  "paramDataType": "number",
                  "description": "количество скважин"
                }
              }
            },
            {
              "title": "организация переликвидации скважин",
              "text": "по организации переликвидации и консервации #count# скважин и восстановаления #countTumb# разрушенных тумб",
              "source": {
                "count": {
                  "type": "input",
                  "description": "количество скважин",
                  "paramDataType": "number"
                },
                "countTumb": {
                  "type": "input",
                  "description": "количество разрушенных тумб",
                  "paramDataType": "number"
                }
              }
            },
            {
              "title": "в области обеспечения материально-техническими ресурсами",
              "text": "по организации поставки материально-технических ресурсов (МТР), оказания услуг по монтажу, шефмонтажу, наладке и пуску в эксплуатацию оборудования, услуг по инспектированию качества изготовления МТР и иных услуг",
              "source": {}
            }
          ]
        }
      }
    }
  }
}
