'use strict';
const vectorName = '_search';

const searchObjects = {
  rdoc: ['"Budget_Activity_Title"', '"Program_Element_Title"', '"Program_Element_Notes"', '"PE_Mission_Description_and_Budget_Justification"', '"Project_Mission_Description"'],
  pdoc: ['"Program_Description"', '"Budget_Activity_Title"', '"Budget_Line_Item_Title"', '"Budget_Justification"']
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return Promise.all(Object.keys(searchObjects).map(async (table) =>
    { 
      const indexName = table + '_vector_index';
      const triggerName = table + '_vector_trigger';

      try {
        return sequelize.query(`ALTER TABLE ${table} ADD COLUMN "${vectorName}" TSVECTOR;`)
        .then(() => {
          console.log('Column added: updating values');
          return sequelize.query(`UPDATE ${table} SET ${vectorName} = to_tsvector('english', ${searchObjects[table].join(" || ' ' || ")});`)
          .catch(console.log);
        }).then(() => {
          console.log('Values added: creating index');
          return sequelize.query(`CREATE INDEX ${indexName} ON ${table} USING gin("${vectorName}");`)
          .catch(console.log);
        }).then(() => {
          console.log('Index created: Adding trigger');
          return sequelize.query(`CREATE TRIGGER ${triggerName} BEFORE INSERT OR UPDATE ON ${table} FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("${vectorName}", 'pg_catalog.english', '${searchObjects[table].join(', ')}')`)
          .catch(console.log);
        }).then(() => {
          console.log('All done');
        }).catch(console.log);
      } catch (e) {
        console.log(e);
      }
    }
    ));    
  },

  down: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return Promise.all(Object.keys(searchObjects).map(async (table) =>
    { 
      const indexName = table + '_vector_index';
      const triggerName = table + '_vector_trigger';

      try {
        return sequelize.query(`DROP TRIGGER ${triggerName} ON "${table}"`)
        .then(() => {
          console.log('Remove trigger');
          return sequelize.query(`DROP INDEX ${indexName}`)
          .catch(console.log);
        }).then(() => {
          console.log('Remove index');
          return sequelize.query(`ALTER TABLE "${table}" DROP COLUMN "${vectorName}"`)
          .catch(console.log);
        }).then(() => {
          console.log('Remove column');
        }).catch(console.log);
      } catch (e) {
        console.log(e);
      }
    }
    )); 
  }
};
