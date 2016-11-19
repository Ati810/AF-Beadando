'use strict'

const Lucid = use('Lucid')

class Game extends Lucid {
  reviews(){
    return this.hasMany("App/Model/Review");
  }
}

module.exports = Game
