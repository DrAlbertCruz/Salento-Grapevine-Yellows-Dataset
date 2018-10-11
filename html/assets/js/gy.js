window.onload = function() {
	var newExperimentButton = document.getElementById("newExperimentButton");
	var yesButton = document.getElementById("yesButton");
	var noButton = document.getElementById("noButton");
	var submitButton = document.getElementById("submitEmail");
	var emailField = document.getElementById("emailInput");
	var nameField = document.getElementById("nameInput");
	var currentExperiment = new experiment();
	var currentJob = new imageJob();
	
	newExperimentButton.onclick = function() {
		currentExperiment.resetExperiment();
		currentExperiment.display();
		setNewImage();
		return false;
	};
	
	yesButton.onclick = function() {
		currentExperiment.increment( currentJob.label, 0 ); // Increment results
		setNewImage();
		return false;
	};
	
	noButton.onclick = function() {
		// It doesn't really matter which one this is as long as its not 0
		currentExperiment.increment( currentJob.label, 1 );	// Increment results
		setNewImage();
		return false;
	};
	
	// Callback for when the user clicks on the 'send' button to report results via email
	submitButton.onclick = function() {
		var resultsString = 'Hi,\r\n\r\nHere is a summary of your results:\r\nName: '
			+ nameField.value + '\r\n'
			+ currentExperiment.displayString() + '\r\n'
			+ 'Thanks!';
		var data = {
		    name: nameField.value,
		    email: emailField.value,
		    message: resultsString
		};
		$.ajax({
		    type: "POST",
		    url: "email.php",
		    data: data,
		    success: function(){
		    $('.success').fadeIn(1000);
		    }
		});
		return false;
	};
	
	setNewImage = function() {
		currentJob = new imageJob();	// Reset job
		currentExperiment.display();	// Refresh the display
	};
}

function spamcheck($field) {
    $field=filter_var($field, FILTER_SANITIZE_EMAIL);

    if(filter_var($field, FILTER_VALIDATE_EMAIL)) {
        return true;
    }
    else {
        return false;
    }
}

function sendMail($toEmail, $fromEmail, $subject, $message) {
    $validFromEmail = spamcheck($fromEmail);
    if($validFromEmail) {
        mail($toEmail, $subject, $message, "From: $fromEmail");
    }
}


var imageJob = function() {
	this.imagePath = "../raw/";				// Path to images
	this.numClasses = 6;							// Repeated, probably need to address this
	// 1/3 a prior chance of pulling a GY yellows
	this.label = Math.floor( Math.random() * 3 );
	switch (this.label) {
		case 0:
			this.imagePath = this.imagePath + "GY/"; break;
		case 1:
			this.imagePath = this.imagePath + "Other/"; break;
		case 2:
			this.imagePath = this.imagePath + "Healthy/"; break;
	}
	this.imagePath = this.imagePath + 'image-' + Math.ceil( Math.random() * 85 ) + '.jpg';
	document.getElementById("imagePane").setAttribute("src",this.imagePath);
	document.getElementById("imagePane").setAttribute("width","450px");
}

var experiment = function() {
	this.n = 0;				// Number of negatives
	this.p = 0;				// Number of positives
	this.tp = 0;			// Number of true positives
	this.tn = 0;			// Number of true negatives
	this.fp = 0;			// Number of false positives
	this.fn = 0;			// Number of false negatives
	
	// results.incr, increment a point in the confusion matrix.
	// First element is the correct label, second element is the guess
	this.increment = function(label, guess) {
		// The 'positive' category in this scenario is the number 0
		if (label == 0 && guess == 0) {
			this.tp++;
			this.p++;
		}
		else if (label == 0 && guess != 0) {
			this.fn++;
			this.p++;
		}
		else if (label != 0 && guess == 0) {
			this.fp++;
			this.n++;
		}
		else {
			this.tn++;
			this.n++;
		}
	};
	
	// Call this function to get a string of formatted results
	this.displayString = function () {
		return 'True positives: ' + this.tp + '\r\n'
			+ 'False negatives: ' + this.fn + '\r\n'
			+ 'False positives: ' + this.fp + '\r\n'
			+ 'True negatives: ' + this.tn + '\r\n';
	}
	
	// This function used to set everything to zero
	this.resetExperiment = function() {
		this.n = 0;				// Number of negatives
		this.p = 0;				// Number of positives
		this.tp = 0;			// Number of true positives
		this.tn = 0;			// Number of true negatives
		this.fp = 0;			// Number of false positives
		this.fn = 0;			// Number of false negatives
	};
	
	this.display = function() {
		document.getElementById( "truePositives" ).innerHTML = this.tp;
		document.getElementById( "falseNegatives" ).innerHTML = this.fn;
		document.getElementById( "falsePositives" ).innerHTML = this.fp;
		document.getElementById( "trueNegatives" ).innerHTML = this.tn;
	};
}
