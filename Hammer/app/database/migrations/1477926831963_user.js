'use strict';

const Schema = use('Schema');

class UserTableSchema extends Schema {
    up () {
        this.create('user', (table) => {
            table.increments('id');
			table.string('username', 80).notNullable().unique();
			table.string('password', 60).notNullable();
            table.string('email', 254).notNullable().unique();
            table.string('firstname', 80).notNullable();
			table.string('lastname', 80).notNullable();
			table.text('avatar');
			table.text('games');
			table.text('favourites');
			table.text('reviews');
			table.text('purchases');
            table.timestamps();
        })
    }

    down () {
        this.drop('user');
    }
}

module.exports = UserTableSchema;
