'use strict'

const Lucid = use('Lucid')

class Review extends Lucid {
  user(){
    return this.hasOne("App/Model/User");
  }

  game(){
    return this.hasOne("App/Model/Game");
  }
}

module.exports = Review
