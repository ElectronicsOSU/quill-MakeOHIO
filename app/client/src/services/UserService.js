angular.module('reg')
  .factory('UserService', [
  '$http',
  'Session',
  function($http, Session){

    var base = '' + '/api/users';

    return {

      // ----------------------
      // Basic Actions
      // ----------------------
      getCurrentUser: function(){
        return $http.get(base + '/' + Session.getUserId());
      },

      get: function(id){
        return $http.get(base + '/' + id);
      },

      getAll: function(){
        return $http.get(base + '/');
      },

      getPage: function(page, size, text, statusFilters){
        return $http.get(base + '?' + $.param(
          {
            text: text,
            page: page ? page : 0,
            size: size ? size : 50,
            statusFilters: statusFilters ? statusFilters : {}
          })
        );
      },

      updateProfile: function(id, profile){
        return $http.put(base + '/' + id + '/profile', {
          profile: profile
        });
      },

      updateConfirmation: function(id, confirmation){
        return $http.put(base + '/' + id + '/confirm', {
          confirmation: confirmation
        });
      },

      declineAdmission: function(id){
        return $http.post(base + '/' + id + '/decline');
      },

      // ------------------------
      // Team
      // ------------------------
      joinOrCreateTeam: function(code){
        return $http.put(base + '/' + Session.getUserId() + '/team', {
          code: code
        });
      },

      leaveTeam: function(){
        return $http.delete(base + '/' + Session.getUserId() + '/team');
      },

      getMyTeammates: function(){
        return $http.get(base + '/' + Session.getUserId() + '/team');
      },

      // -------------------------
      // Admin Only
      // -------------------------

      getStats: function(){
        return $http.get(base + '/' + 'stats');
      },

      getCSV: function(){
        return $http.get(base + '/' + 'exportcsv').success(function (data, status, headers) {
        headers = headers();
        var filename = headers['x-filename'];
        var contentType = headers['content-type'];

        var linkElement = document.createElement('a');
        try {
            var blob = new Blob([data], { type: contentType });
            var url = window.URL.createObjectURL(blob);
            linkElement.setAttribute('href', url);
            linkElement.setAttribute("download", filename);
            var clickEvent = new MouseEvent("click", {
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            linkElement.dispatchEvent(clickEvent);
        } catch (ex) {
            console.log(ex);
        }
        }).error(function (data) {
        console.log(data);
        });
      },

      admitUser: function(id){
        return $http.post(base + '/' + id + '/admit');
      },

      checkIn: function(id){
        return $http.post(base + '/' + id + '/checkin');
      },

      checkOut: function(id){
        return $http.post(base + '/' + id + '/checkout');
      },

    };
  }
  ]);
