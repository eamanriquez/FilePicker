 (function() {
	 var FilePicker = window.FilePicker = function(options) {
		// Config
		this.apiKey = options.apiKey;
		this.clientId = options.clientId;
		// Elements
		this.buttonEl = options.buttonEl;
		// Events
		this.onSelect = options.onSelect;
		this.buttonEl.addEventListener('click', this.open.bind(this));		
	// Disable the button until the API loads, as it won't work properly until then.
		this.buttonEl.disabled = true;
		// Load the drive API
		gapi.client.setApiKey(this.apiKey);
		gapi.client.load('drive', 'v2', this._driveApiLoaded.bind(this));
		google.load('picker', '1', { callback: this._pickerApiLoaded.bind(this) });
	}

	FilePicker.prototype = {
		/**
		 * Open the file picker.
		 */
		 open: function() {		
			// Check if the user has already authenticated
			var token = gapi.auth.getToken();
			if (token) {
				this._showPicker();
			} else {
				// The user has not yet authenticated with Google
				// We need to do the authentication before displaying the Drive picker.
				this._doAuth(false, function() { this._showPicker(); }.bind(this));
			}
		},
		
		/**
		 * Show the file picker once authentication has been done.
		 * @private
		 */
		 _showPicker: function() {
		 	var accessToken = gapi.auth.getToken().access_token;

		 	var view = new google.picker.DocsView(google.picker.ViewId.DOCS);
			// solo ver archivos de mi propiedad
			view.setOwnedByMe(true);

			// Use DocsUploadView to upload documents to Google Drive.
			var uploadView = new google.picker.DocsUploadView();


			this.picker = new google.picker.PickerBuilder().
			addView(view).
			addView(uploadView).
			setAppId(this.clientId).
			setOAuthToken(accessToken).
			setCallback(this._pickerCallback.bind(this)).

			build().

			setVisible(true);
	},
		
		
		/**
		 * Called when a file has been selected in the Google Drive file picker.
		 * @private
		 */
		 _pickerCallback: function(data) {
		 	if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
		 		var file = data[google.picker.Response.DOCUMENTS][0],
		 		id = file[google.picker.Document.ID],
		 		request = gapi.client.drive.files.get({
		 			fileId: id
		 		});

				request.execute(this._fileGetCallback.bind(this));
				
				
				
				

				
			}
		},
		/**
		 * Called when file details have been retrieved from Google Drive.
		 * @private
		 */
		 _fileGetCallback: function(file) {
		 	if (this.onSelect) {
				
				var requestList = gapi.client.drive.permissions.list({
					'fileId': file.id
				});


				var idPermiso;
				requestList.execute(function(resp) {
					console.log("*************");	
					idPermiso = resp.items[0].id;
					console.log(idPermiso);
					console.log("*************");
					
					
					
				 var permissionBody = {
      				'value': '',
     				 'type': 'anyone',
     				 'role': 'reader'
   				  };
			
					var permissionRequest = gapi.client.drive.permissions.insert({
      					'fileId': file.id,
     				 'resource': permissionBody
    				});
					
					permissionRequest.execute(function(resp) {
							//console.log(resp);
						
						 });
					
					

				});


				
				this.onSelect(file);
			}
		},
		
		/**
		 * Called when the Google Drive file picker API has finished loading.
		 * @private
		 */
		 _pickerApiLoaded: function() {
		 	this.buttonEl.disabled = false;

		 },

		/**
		 * Called when the Google Drive API has finished loading.
		 * @private
		 */
		 _driveApiLoaded: function() {
		 	this._doAuth(true);
		 },

		/**
		 * Authenticate with Google Drive via the Google JavaScript API.
		 * @private
		 */
		 _doAuth: function(immediate, callback) {	

		 	var SCOPES = [
		 	'https://www.googleapis.com/auth/drive',
		 	'https://www.googleapis.com/auth/drive.file'];



          gapi.auth.authorize({
          	client_id: this.clientId + '.apps.googleusercontent.com',
          	scope: SCOPES,
          	immediate: immediate
          }, callback);


      }
  };
}());



