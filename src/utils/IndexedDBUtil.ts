import { GenericIdentifierType } from './GenericIdentifierType';
import { Parser } from './Parser';
import { renderers } from './utils';
import { DBSchema, openDB } from '@tempfix/idb';

const dbName: string = 'pid-component';
const dbVersion: number = undefined;

interface PIDComponentDB extends DBSchema {
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

const dbPromise = openDB<PIDComponentDB>(dbName, dbVersion, {
  upgrade(db) {
    const entityStore = db.createObjectStore('entities', {
      keyPath: 'value',
    });
    entityStore.createIndex('by-context', 'context', { unique: false });

    const relationStore = db.createObjectStore('relations', {
      autoIncrement: true,
    });
    relationStore.createIndex('by-start', 'start', { unique: false });
    relationStore.createIndex('by-description', 'description', { unique: false });
    relationStore.createIndex('by-end', 'end', { unique: false });
  },
});

export async function addEntity(renderer: GenericIdentifierType) {
  const context = document.documentURI;
  const db = await dbPromise;

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

  const tx = db.transaction('relations', 'readwrite');
  const promises = [];

  for (const item of renderer.items) {
    const relation = {
      start: renderer.value,
      description: item.keyTitle,
      end: item.value,
      // connectionType: "startToEnd"
    };
    const index = tx.store.index('by-start');
    let cursor = await index.openCursor();
    while (cursor) {
      if (cursor.value.start === relation.start && cursor.value.end === relation.end && cursor.value.description === relation.description) {
        // relation already exists
        return;
      }
      cursor = await cursor.continue();
    }
    promises.push(tx.store.add(relation));
  }
  promises.push(tx.done);
  await Promise.all(promises);
  console.debug('added relations', promises);
}

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
  try {
    const db = await dbPromise;
    let entity:
      | {
          value: string;
          rendererKey: string;
          context: string;
          lastAccess: Date;
          lastData: any;
        }
      | undefined = await db.get('entities', value);

    if (entity !== undefined) {
      console.debug('Found entity for value in db', entity, value);
      const entitySettings = settings.find(value => value.type === entity.rendererKey)?.values;
      const ttl = entitySettings?.find(value => value.name === 'ttl');

      if (ttl != undefined && ttl.value != undefined && (new Date().getTime() - entity.lastAccess.getTime() > ttl.value || ttl.value === 0)) {
        console.log('TTL expired! Deleting entry in db', ttl.value, new Date().getTime() - entity.lastAccess.getTime());
        await deleteEntity(value);
      } else {
        console.log('TTL not expired or undefined', new Date().getTime() - entity.lastAccess.getTime());
        let renderer = new (renderers.find(renderer => renderer.key === entity.rendererKey).constructor)(value, entitySettings);
        // if (renderer.hasCorrectFormat()) {
        renderer.settings = entitySettings;
        await renderer.init(entity.lastData);
        return renderer;
        // }
      }
    }
  } catch (error) {
    console.error('Could not get entity from db', error);
  }

  console.debug('No valid entity found for value in db', value);
  let renderer = await Parser.getBestFit(value, settings);
  // renderer.settings = settings.find(value => value.type === renderer.getSettingsKey())?.values
  // await renderer.init()
  await addEntity(renderer);
  console.debug('added entity to db', value, renderer);
  return renderer;
};

export async function deleteEntity(value: string) {
  const db = await dbPromise;
  await db.delete('entities', value);
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

export async function deleteAllByContext(context: string) {
  const db = await dbPromise;
  const tx = db.transaction('entities', 'readwrite');
  const entities = await tx.store.index('by-context').getAll(context);
  for (const entity of entities) {
    await deleteEntity(entity.value);
  }
  console.log('deleted all entities for context', context);
  await tx.done;
}
