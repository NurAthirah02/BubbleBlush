/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1313930376")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3268069807",
    "hidden": false,
    "id": "relation3202325850",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "receiptID",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1313930376")

  // remove field
  collection.fields.removeById("relation3202325850")

  return app.save(collection)
})
