class QuizApp {
    constructor() {
        this.data = [];
        this.randomQuestionNumber = null;
        this.displayOptions = [];
        this.alreadyQuestioned = [];
    }

    /**
    * Inits the application
    */
    async init() {
        await this.loadPhrases();
        this.displayNextQuestion();
        document.getElementById('answer-button-container').addEventListener("click", (event) => {
            this.checkAnswer(event);
        });
    }

    /**
    * Loads the phrases from a JSON datafile.
    */
    async loadPhrases() {
        try {
            //await fetch returns a promise in form of an http object which is rather a representation of the JSON, it does not contain it actually.
            const response = await fetch('assets/data/phrases.json');
            //awair response returns a second promise, resolving the result of parsing the response body text as JSON.
            this.data = await response.json();
            //CallBack function that runs when data is loaded
            this.onPhrasesLoaded();
            //catch error when something went wrong fetching the JSON file
        } catch (error) {
            console.error("There was an error fetching the JSON file", error);
        }
    }

    /** Callback function executed after the phrases are loaded.
    * It triggers the display of the next question.
    */
    onPhrasesLoaded() {
        this.displayNextQuestion();
    }

    /**
    * Displays the next question and possible answers on the screen.
    */
    displayNextQuestion() {
        do {
            this.randomQuestionNumber = Math.floor(Math.random() * this.data.length);
        } while (this.alreadyQuestioned.includes(this.randomQuestionNumber));
        this.alreadyQuestioned.push(this.randomQuestionNumber);
        if (this.alreadyQuestioned.length === this.data.length) {
            this.alreadyQuestioned = [];
            alert("Congratulation! You corrected all phrases in this game.");
            //TODO: Let the user decide to go for another round
        }

        let questionObject = this.data[this.randomQuestionNumber];
        let wrongOptions = this.data[this.randomQuestionNumber].wrong_options;
        let numberOfPossibleAnswers = document.getElementById("answer-button-container").children.length;



        this.displayOptions = this.generateAnswerObject(wrongOptions, questionObject.original_word, numberOfPossibleAnswers - 1);

        document.getElementById("display-question").textContent = questionObject.altered_phrase;
        document.getElementById("display-hint").textContent = questionObject.source;

        for (let i = 0; i < numberOfPossibleAnswers; i++) {
            document.getElementById(`answer${i + 1}`).textContent = this.displayOptions[i].displayValue;
        }
    }

    /**
    * Generates an array of answer objects, including wrong and one correct answers.
    * 
    * @param {Array} wrongOptions - Array containing potential wrong answers.
    * @param {string} correctWord - The correct answer.
    * @param {number} numberOfWrongAnswers - The number of wrong answers to be included.
    * 
    * @returns {Array} - An array of answer objects shuffled.
    */
    generateAnswerObject(wrongOptions, correctWord, numberOfWrongAnswers) {
        const shuffledWrongOptions = this.fisherYatesShuffle([...wrongOptions]);
        const selectedWrongOptions = shuffledWrongOptions.slice(0, numberOfWrongAnswers).map(option => ({
            displayValue: option,
            displayCorrect: false
        }));

        const correctOption = {
            displayValue: correctWord,
            displayCorrect: true
        };

        return this.fisherYatesShuffle([...selectedWrongOptions, correctOption]);
    }

    /**
    * Checks if the clicked answer button corresponds to the correct answer.
    * 
    * @param {Event} event - The click event.
    */
    checkAnswer(event) {
        //Get clicked answer-button
        if (event.target.classList.contains('answer-button')) {
            const index = parseInt(event.target.id.toString().slice(-1)) - 1;
            if (this.displayOptions[index].displayCorrect) {
                alert("Genius! That was correct.");
                this.incrementScore('correct');
                this.displayNextQuestion();
            } else {
                alert("Try again");
                this.incrementScore('incorrect');
            }
        };
    }

    /**
    * Increases the score (either 'correct' or 'incorrect') in the DOM.
    * 
    * @param {string} type - Type of score to increment ('correct' or 'incorrect').
    */
    incrementScore(type) {
        const element = document.getElementById(type);
        const oldScore = parseInt(element.innerText);
        element.innerText = oldScore + 1;
    }

    /**
    * Shuffles an array using the Fisher-Yates algorithm.
    * 
    * @param {Array} array - The array to shuffle.
    * @returns {Array} - The shuffled array.
    */
    fisherYatesShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};

/**
 * Reveals the audio controls after clicking the linked button.
 * 
 * @param {String} buttonId - The clicked button
 * @param {String} audioControlId - The audio control to reveal
 */
function revealAudioBtn(buttonId, audioControlId){
    document.getElementById(buttonId).addEventListener('click', function(event) {
        var audioControl = document.getElementById(audioControlId);
        var buttonControl = event.target;
        if (audioControl.style.display === "none") {
            audioControl.style.display = "block";
            buttonControl.style.display = "none";
        } else {
            audioControl.style.display = "none";
        }
    });
}

/**
*Reveal the display of the quiz
*/
 function revealGame(){
    document.getElementById('reveal-game-btn').addEventListener('click', function(event) {
        document.getElementById('game').style.display = "block";
        event.target.style.display = "none";
        let app = new QuizApp();
        app.init();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    revealAudioBtn('reveal-intro-btn','audio-control-intro');
    revealAudioBtn('reveal-howto-btn','audio-control-howto');
    revealAudioBtn('reveal-rules-btn','audio-control-rules');
    revealGame();
});
