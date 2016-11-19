'use strict'

const Schema = use('Schema')

class GamesTableSchema extends Schema {
	up () {
        this.create('games', (table) => {
            table.increments('id');
			table.string('name').notNullable().unique();
			table.string('developer').notNullable();
			table.string('publisher').notNullable();
            table.string('releasedate').notNullable();
			table.text('pictures');
			table.text('description').notNullable();
			table.text('categories');
			table.text('reviews');
      table.double('price').notNullable();
            table.timestamps();
        })
    }

	down () {
		this.drop('games')
	}
}

module.exports = GamesTableSchema
