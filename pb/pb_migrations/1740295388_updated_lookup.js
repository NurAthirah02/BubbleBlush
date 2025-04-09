/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3339701323")

  // remove field
  collection.fields.removeById("number1032740943")

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1032740943",
    "max": 0,
    "min": 0,
    "name": "parent",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3339701323")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number1032740943",
    "max": null,
    "min": null,
    "name": "parent",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // remove field
  collection.fields.removeById("text1032740943")

  return app.save(collection)
})
