/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4210190914")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number4224779492",
    "max": null,
    "min": null,
    "name": "counterAttempt",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2063623452",
    "max": 0,
    "min": 0,
    "name": "status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4210190914")

  // remove field
  collection.fields.removeById("number4224779492")

  // remove field
  collection.fields.removeById("text2063623452")

  return app.save(collection)
})
