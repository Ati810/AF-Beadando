'use strict'

const Schema = use('Schema')

class PurchasesTableSchema extends Schema {
	up () {
        this.create('purchases', (table) => {
            table.increments('id');
            table.integer('userid').unsigned().references('id').inTable('user');
            table.text('gameids').notNullable();
            table.text('date').notNullable();
            table.double('price').notNullable();
            table.timestamps();
        })
    }

	down () {
		this.drop('purchases')
	}
}

module.exports = PurchasesTableSchema
