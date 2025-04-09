/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3339701323",
    "hidden": false,
    "id": "relation2668241686",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "roomID",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3339701323",
    "hidden": false,
    "id": "relation129109000",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "departmentID",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3339701323",
    "hidden": false,
    "id": "relation2209144128",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "roleID",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("relation2668241686")

  // remove field
  collection.fields.removeById("relation129109000")

  // remove field
  collection.fields.removeById("relation2209144128")

  return app.save(collection)
})
