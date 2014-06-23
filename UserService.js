angular.module('user', [])
.service('UserService', [function() {
  var _user = {};
  var _is_authenticated = false;
  var _is_admin = false;
  var _admin_field = 'admin'; // Default setting for which column indicates a user is an admin or not
  var _admin_as_boolean = false;  // Setting for whether admin flag should be treated as boolean or a 1/0 flag... true = boolean, false = 1/0 flag
  var _user_fields = ['first_name', 'last_name', 'email', 'id', 'api_token'] // Default fields provided for the _user array

  /******* PRIVATE METHODS ******/
  _isAllowed = function(user_id, permissions) {
    // Checks whether the user can view a particular resource.  Should return true/false
    switch(permissions) {
      case 'public':
        return true;
        break;
      case 'owner':
        return this.isOwner(user_id);
        break;
      case 'owner_or_admin':
        return (this.isOwner(user_id) || this.getUserAdmin());
      case 'admin':
        return (this.getUserAdmin());
      default: return false;
    }
  };
  _authenticateUser = function(value) {
    // Flags the user as being authenticated.  Should return true/false
    _is_authenticated = true;
  };


  /******* PUBLIC METHODS *******/
  this.setCurrentUserFields = function(fields_array) {
    /*
      Defines which fields should be available as the current_user.  Defaults are provided so setting this is not required.
      Uses inputs as both key and value so fields in current_user will match API response
    */
    _user_fields = fields_array;
  };
  this.setAdminField = function(admin_field) {
    /*
      Defines which field is the admin flag.  Defaults are provided so setting this is not required.
      Setting this to null will remove admin functionality
    */
    _admin_field = admin_field;
  };
  this.setCurrentUser = function(values) {
    /*
      Sets user information for service
      This information would most likely come from an API response after authentication
    */

    // Loop through the fields provided with current user and assign them from API response
    for(i=0; i<_user_fields.length; i++) {
      field = _user_fields[i];
      _user[field] = values[field];
    }

    // Set admin functionality
    if(_admin_field != null ) {
      _user[_admin_field] = values[_admin_field];
    };
    
    // Authenticate the user for the service
    this.authenticateUser();
  };
  this.isAuthenticated = function() {
    // Returns whether a user has been authenticated or not.  Should return true/false so can be used in ng-show directives
    return _is_authenticated;
  };
  this.isPermitted = function(role_required, user_id) {
    // Checks whether the user is allowed to view a resource based on role.  Should eturns true or false so can be used with an ng-show directive
    switch(role_required) {
      case 'public':  // No permission required... everyone is allowed to play
        return true;
        break;
      case 'owner':   // Should be authenticated and own the resource
        return (_is_authenticated && _isOwner(user_id));
        break;
      case 'owner_or_admin':  // Should be authenticated and either the owner of a resource or an admin
        return (_is_authenticated && (this.getUserAdmin() || _isOwner(user_id)));
        break;
      case 'admin':   // Should be authenticated and an admin
        return (this.getUserAdmin() && _is_authenticated);
        break;
      default: return false;
    }
  };
  this.isOwner = function(user_id) {
    // Checks whether a given user is the current user.  Should return true/false
    if(user_id == _user.id) {
      return true;
    }
    else {
      return false;
    }
  };
  this.isAdmin = function() {
    // Returns whether or not the user is an admin.  Should return true/false so can be used in ng-show directives
    if(_admin_field != null) {
      // A specific field for the admin flag has been provided so interpret it
      if(_admin_as_boolean) {
        // Admin flag is either true/false
        return _user[_admin_flag];
      }
      else {
        // Admin flag is a 1/0... interpret it and return true or false
        if(_is_admin == 1) { return true; } else { return false; }  
      };
    } 
    else {
      return true;  // No admin variable set so everyone is considered an admin!
    }
  };
  this.logoutUser = function() {
    // Clears out user information and logs out user
    _is_authenticated = false;
    _user = {};
  };
  this.getCurrentUser = function() {
    // Returns user information for use in views and controllers (e.g. User name in nav bar)
    return _user;
  };

  return this;
}]);
