'use strict'

const Schema = use('Schema')

class ReviewsTableSchema extends Schema {
	up () {
        this.create('reviews', (table) => {
            table.increments('id');
            table.integer('userid').unsigned().references('id').inTable('user');
            table.integer('gameid').unsigned().references('id').inTable('game');
            table.text('date').notNullable();
            table.real('text').notNullable();
            table.integer('rating').notNullable();
            table.timestamps();
        })
    }

	down () {
		this.drop('reviews')
	}
}

module.exports = ReviewsTableSchema
