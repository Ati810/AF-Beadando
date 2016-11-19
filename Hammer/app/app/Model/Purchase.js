'use strict'

const Lucid = use('Lucid')

class Purchase extends Lucid {
  user(){
    return this.hasOne("App/Model/User");
  }

  games(){
    return this.hasMany("App/Model/Game");
  }
}

module.exports = Purchase
