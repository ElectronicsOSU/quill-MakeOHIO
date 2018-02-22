angular.module('reg')
  .controller('ApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function($scope, $rootScope, $state, $http, currentUser, Settings, Session, UserService){

      var base = '';

      // Set up the user
      $scope.user = currentUser.data;

      // Has the student uploaded their resume?
      $scope.hasUploadedResume = $scope.user.status.completedProfile;
      $scope.resumeFileName = $scope.user.email + '.pdf';

      // Is the student from OSU?
      $scope.isOSUStudent = ($scope.user.email.split('@')[1] == 'osu.edu') || ($scope.user.email.split('@')[1] == 'buckeyemail.osu.edu');

      // If so, default them to adult: true
      if ($scope.isOSUStudent){
        $scope.user.profile.adult = true;
      }

      // Populate the school dropdown
      populateSchools();
      _setupForm();

      $scope.regIsClosed = Date.now() > Settings.data.timeClose;

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){
        $http
          .get('assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.user.email.split('@')[1];

            if (schools[email]){
              $scope.user.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }
          });

        $http
          .get('assets/schools.csv')
          .then(function(res){ 
            $scope.schools = res.data.split('\n');
            $scope.schools.push('Other');

            var content = [];

            for(i = 0; i < $scope.schools.length; i++) {                                          
              $scope.schools[i] = $scope.schools[i].trim(); 
              content.push({title: $scope.schools[i]})
            }

            $('#school.ui.search')
              .search({
                source: content,
                cache: true,     
                onSelect: function(result, response) {                                    
                  $scope.user.profile.school = result.title.trim();
                }        
              })             
          });          
      }

      function _updateUser(e){
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .success(function(data){
            sweetAlert({
              title: "Awesome!",
              text: "Your application has been saved.",
              type: "success",
              confirmButtonColor: "#e76482"
            }, function(){
              $state.go('app.dashboard');
            });
          })
          .error(function(res){
            sweetAlert("Uh oh!", "Something went wrong.", "error");
          });
      }

      function isMinor() {
        return !$scope.user.profile.adult;
      }

      function minorsAreAllowed() {
        return Settings.data.allowMinors;
      }

      function minorsValidation() {
        // Are minors allowed to register?
        if (isMinor() && !minorsAreAllowed()) {
          return false;
        }
        return true;
      }

      function _setupForm(){
        // Custom minors validation rule
        $.fn.form.settings.rules.allowMinors = function (value) {
          return minorsValidation();
        };

        // Semantic-UI form validation
        $('.ui.form').form({
          inline: true,
          fields: {
            name: {
              identifier: 'name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your name.'
                }
              ]
            },
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school name.'
                }
              ]
            },
            major: {
              identifier: 'major',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your major.'
                }
              ]
            },
            year: {
              identifier: 'year',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your graduation year.'
                }
              ]
            },
            gender: {
              identifier: 'gender',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a gender.'
                }
              ]
            },
            resume: {
              identifier: 'resume',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please choose a file for your resume.'
                }
              ]
            },
            adult: {
              identifier: 'adult',
              rules: [
                {
                  type: 'allowMinors',
                  prompt: 'You must be an adult.'
                }
              ]
            }
          }
        });
      }

      $scope.getResume = function(ev){
        ev.preventDefault(); // prevent href default behavior
        console.log("Requesting server to download user's resume");
        UserService.getResume($scope.resumeFileName);
      };


	 function uploadResume(){
		 $("#resume").submit(function(e) {
			e.preventDefault();

			var fileSizeBytes = (this[0].files[0].size / 1024 / 1024);
			var fileSize = fileSizeBytes.toFixed(2);
			if(fileSize > 2){
				sweetAlert("Uh oh!", "Your resume file is too large:\n The limit is 2 MB, your file is " + (fileSize) + " MB", "error");
				return;
                        };
			var formData = new FormData(this);
			formData.append('email',$scope.user.email);
			$.ajax({
				url: "/register/upload",
				type: 'POST',
				data: formData,
				success: function (data) {
					_updateUser();
				},
				error: function () {
					sweetAlert("Uh oh!", "Something went wrong with uploading your resume!", "error");
				},
				cache: false,
				contentType: false,
				processData: false
			});
		});
		$("#resume").submit();
		 
	 }

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
		  uploadResume();
          //_updateUser();
        }
        else{
          sweetAlert("Uh oh!", "Please complete the required fields!", "error");
        }
      };

    }]);
