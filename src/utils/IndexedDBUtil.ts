import { GenericIdentifierType } from './GenericIdentifierType';
import { Parser } from './Parser';
import { renderers } from './utils';
import { DBSchema, openDB } from '@tempfix/idb';

const dbName: string = 'pid-component';
const dbVersion: number = undefined;

/**
 * The database schema for the PID component.
 * @interface PIDComponentDB
 * @extends DBSchema
 */
export interface PIDComponentDB extends DBSchema {
  entities: {
    key: string;
    value: {
      value: string;
      rendererKey: string;
      context: string;
      lastAccess: Date;
      lastData: any;
    };
    indexes: {
      'by-context': string;
    };
  };

  relations: {
    key: string;
    value: {
      start: string;
      description: string;
      end: string;
    };
    indexes: {
      'by-start': string;
      'by-end': string;
      'by-description': string;
    };
  };
}

/**
 * Opens the indexedDB database for the PID component and creates the object stores and indexes if they do not exist.
 * @type {Promise<IDBPDatabase<PIDComponentDB>>}
 * @const
 */
const dbPromise = openDB<PIDComponentDB>(dbName, dbVersion, {
  upgrade(db) {
    const entityStore = db.createObjectStore('entities', {
      keyPath: 'value',
    });
    entityStore.createIndex('by-context', 'context', { unique: false });

    const relationStore = db.createObjectStore('relations', {
      autoIncrement: true,
    });

    // Create indexes for the relations
    relationStore.createIndex('by-start', 'start', { unique: false });
    relationStore.createIndex('by-description', 'description', { unique: false });
    relationStore.createIndex('by-end', 'end', { unique: false });
  },
});

/**
 * Adds an entity to the database.
 * @param {GenericIdentifierType} renderer The renderer to add to the database.
 */
export async function addEntity(renderer: GenericIdentifierType) {
  const context = document.documentURI;
  const db = await dbPromise;

  // Add the entity to the entities object store
  await db
    .add('entities', {
      value: renderer.value,
      rendererKey: renderer.getSettingsKey(),
      context: context,
      lastAccess: new Date(),
      lastData: renderer.data,
    })
    .catch(reason => {
      if (reason.name === 'ConstraintError') {
        console.debug('Entity already exists', reason);
      } else console.error('Could not add entity', reason);
    });
  console.debug('added entity', renderer);

  // Add the relations to the relations object store
  // Start a new transaction
  const tx = db.transaction('relations', 'readwrite');
  const promises = [];

  for (const item of renderer.items) {
    // Create a relation object
    const relation = {
      start: renderer.value,
      description: item.keyTitle,
      end: item.value,
    };
    // Check if the relation already exists
    const index = tx.store.index('by-start');
    let cursor = await index.openCursor();
    while (cursor) {
      if (cursor.value.start === relation.start && cursor.value.end === relation.end && cursor.value.description === relation.description) {
        // relation already exists
        return;
      }
      cursor = await cursor.continue();
    }
    // Add the relation to the relations object store if it does not exist
    promises.push(tx.store.add(relation));
  }
  promises.push(tx.done);
  await Promise.all(promises);
  console.debug('added relations', promises);
}

/**
 * Gets an entity from the database. If the entity does not exist, it is created.
 * @returns {Promise<GenericIdentifierType>} The renderer for the entity.
 * @param {string} value The stringified value of the entity, e.g. the PID.
 * @param {{type: string, values: {name: string, value: any}[]}[]} settings The settings for all renderers.
 */
export const getEntity = async function (
  value: string,
  settings: {
    type: string;
    values: {
      name: string;
      value: any;
    }[];
  }[],
): Promise<GenericIdentifierType> {
  // Try to get the entity from the database
  try {
    const db = await dbPromise;
    const entity:
      | {
          value: string;
          rendererKey: string;
          context: string;
          lastAccess: Date;
          lastData: any;
        }
      | undefined = await db.get('entities', value);

    if (entity !== undefined) {
      // If the entity was found, check if the TTL has expired
      console.debug('Found entity for value in db', entity, value);
      const entitySettings = settings.find(value => value.type === entity.rendererKey)?.values;
      const ttl = entitySettings?.find(value => value.name === 'ttl');

      if (ttl != undefined && ttl.value != undefined && (new Date().getTime() - entity.lastAccess.getTime() > ttl.value || ttl.value === 0)) {
        // If the TTL has expired, delete the entity from the database and move on to creating a new one (down below)
        console.log('TTL expired! Deleting entry in db', ttl.value, new Date().getTime() - entity.lastAccess.getTime());
        await deleteEntity(value);
      } else {
        // If the TTL has not expired, get a new renderer and return it
        console.log('TTL not expired or undefined', new Date().getTime() - entity.lastAccess.getTime());
        const renderer = new (renderers.find(renderer => renderer.key === entity.rendererKey).constructor)(value, entitySettings);
        renderer.settings = entitySettings;
        await renderer.init(entity.lastData);
        return renderer;
      }
    }
  } catch (error) {
    console.error('Could not get entity from db', error);
  }

  // If no entity was found, create a new one, initialize it and it to the database
  console.debug('No valid entity found for value in db', value);
  const renderer = await Parser.getBestFit(value, settings);
  renderer.settings = settings.find(value => value.type === renderer.getSettingsKey())?.values;
  await renderer.init();
  await addEntity(renderer);
  console.debug('added entity to db', value, renderer);
  return renderer;
};

/**
 * Deletes an entity from the database.
 * @param value The value of the entity to delete.
 */
export async function deleteEntity(value: string) {
  const db = await dbPromise;

  // Delete the entity
  await db.delete('entities', value);

  // Delete all relations for the entity
  const tx = db.transaction('relations', 'readwrite');
  const index = tx.store.index('by-start');
  let cursor = await index.openCursor();
  while (cursor) {
    if (cursor.value.start === value || cursor.value.end === value) {
      await tx.store.delete(cursor.primaryKey);
    }
    cursor = await cursor.continue();
  }
  console.log('deleted entity', value);
  await tx.done;
}

/**
 * Clears all entities from the database.
 * @returns {Promise<void>} A promise that resolves when all entities have been deleted.
 */
export async function clearEntities() {
  const db = await dbPromise;
  await db.clear('entities');
  await db.clear('relations');
  console.log('cleared entities');
}
