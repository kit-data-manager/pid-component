import {DBSchema, openDB} from 'idb';
import {GenericIdentifierType} from "./GenericIdentifierType";
import {renderers} from "./utils";
import {Parser} from "./Parser";

const dbName: string = "pid-component";
const dbVersion: number = undefined;

interface PIDComponentDB extends DBSchema {
  entities: {
    key: string,
    value: {
      value: string,
      rendererKey: string,
      context: string
    }
    indexes: {
      "by-context": string
    }
  }

  relations: {
    key: string,
    value: {
      start: string,
      description: string,
      end: string,
      // connectionType: "none" | "startToEnd" | "bidirectional"
    }
    indexes: {
      "by-start": string,
      "by-end": string,
      "by-predicate": string
    }
  }
}

const dbPromise = openDB<PIDComponentDB>(dbName, dbVersion, {
  upgrade(db) {
    const entityStore = db.createObjectStore("entities", {
      keyPath: "value"
    })
    entityStore.createIndex("by-context", "context", {unique: false})

    const relationStore = db.createObjectStore("relations", {
      autoIncrement: true
    })
    relationStore.createIndex("by-start", "start", {unique: false})
    relationStore.createIndex("by-predicate", "predicate", {unique: false})
    relationStore.createIndex("by-end", "end", {unique: false})
  },
});

export async function addEntity(param: { value: string, renderer: GenericIdentifierType }) {
  const renderer = param.renderer.getSettingsKey()
  const context = document.documentURI
  const db = await dbPromise

  await db.add("entities", {
    value: param.value,
    rendererKey: renderer,
    context: context
  }).catch((reason) => {
    if (reason.name === "ConstraintError") {
      console.log("Entity already exists")
    }
    else console.error("Could not add entity", reason)
  })
  console.log("added entity", param)

  const tx = db.transaction("relations", "readwrite")
  const promises = []

  for (const item of param.renderer.items) {
    const relation = {
      start: param.value,
      description: item.keyTitle,
      end: item.value,
      // connectionType: "startToEnd"
    }
    const index = tx.store.index("by-start")
    let cursor = await index.openCursor()
    while (cursor) {
      if (cursor.value.start === relation.start && cursor.value.end === relation.end && cursor.value.description === relation.description) {
        // relation already exists
        return
      }
      cursor = await cursor.continue()
    }
    promises.push(tx.store.add(relation))
  }
  promises.push(tx.done);
  await Promise.all(promises)
  console.log("added relations", promises)
}

export const getEntity = async function (
  value: string,
  settings: {
    type: string;
    values: {
      name: string;
      value: any;
    }[];
  }[]): Promise<GenericIdentifierType> {

  const context = document.documentURI
  const db = await dbPromise
  let entity: { value: string, rendererKey: string, context: string } | undefined = await db.get("entities", value);
  // return await db.get("entities", value).then(async (e) => {
  //   console.log("got entity for value in db", value, e)
  //   if (e !== undefined) {
  //     if (e.context === context) {
  //       console.log("Found entity for context and value in db", e, context, value)
  //       let renderer = new (renderers.find(renderer => renderer.key === e.rendererKey).constructor)(value)
  //       if (renderer.hasCorrectFormat()) {
  //         renderer.settings = settings.find(value => value.type === renderer.getSettingsKey())?.values
  //         await renderer.init()
  //         return renderer
  //       }
  //     }
  //   }
  // }).catch(async () => {
  //   console.log("No entity found for context and value in db", context, value)
  //   let renderer = await Parser.getBestFit(value, settings);
  //   console.log("best fit", renderer)
  //   renderer.settings = settings.find(value => value.type === renderer.getSettingsKey())?.values
  //   await renderer.init()
  //   await addEntity({value: value, renderer: renderer})
  //   console.log("added entity to db", value, renderer)
  //   return renderer
  // })

  if (entity !== undefined) {
    // if (entity.context === context) {
      console.log("Found entity for context and value in db", entity, context, value)
      let renderer = new (renderers.find(renderer => renderer.key === entity.rendererKey).constructor)(value)
      if (renderer.hasCorrectFormat()) {
        renderer.settings = settings.find(value => value.type === renderer.getSettingsKey())?.values
        await renderer.init()
        return renderer
      }
    // }
  }

  console.log("No entity found for context and value in db", entity, context, value)
  let renderer = await Parser.getBestFit(value, settings);
  renderer.settings = settings.find(value => value.type === renderer.getSettingsKey())?.values
  await renderer.init()
  await addEntity({value: value, renderer: renderer})
  console.log("added entity to db", value, renderer)
  return renderer
}
