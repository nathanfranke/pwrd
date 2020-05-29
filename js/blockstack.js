function Auth(url, scopes = [], manifest = undefined) {
	this.appConfig = new blockstack.AppConfig(scopes, url, "", manifest);
	this.session = new blockstack.UserSession({
		appConfig: this.appConfig
	});
	this.auth = async complete => {
		if(this.session.isUserSignedIn()) {
			//console.log("Signed in...");
			const response = this.session.loadUserData();
			complete(response);
		} else if(this.session.isSignInPending()) {
			//console.log("Pending...");
			try {
				const response = await this.session.handlePendingSignIn();
				complete(response);
			} catch(error) {
				console.error(error);
				snackbar("An error has occurred when attempting to sign in. Please try again.", "#AA0000");
				complete();
			}
			window.history.replaceState(null, null, "/");
		} else {
			//console.log("Unauthenticated");
			complete();
		}
	},
	this.signIn = () => {
		this.session.redirectToSignIn();
	},
	this.signOut = () => {
		this.session.signUserOut();
	}
}
