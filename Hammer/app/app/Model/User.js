'use strict'

const Lucid = use('Lucid')

class User extends Lucid {
  /*reviews(){
    return this.hasMany("App/Model/Review");
  }

  purchases(){
    return this.hasMany("App/Model/Purchase");
  }

  games(){
    return this.hasMany("App/Model/Game");
  }*/

  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

  //http://indicative.adonisjs.com/
  static get rules () {
      return {
          username: 'required|unique:users|min:3|max:80',
          email: 'required|email|unique:users',
          password: 'required|min:6|max:60',
          firstname: 'required|min:3|max:80',
          lastname: 'required|min:3|max:80'
      }
  }
}

module.exports = User
