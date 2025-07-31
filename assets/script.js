/*
=========================================
IA BIDIRECTIONNELLE - LOGIQUE JAVASCRIPT
Jeu d'apprentissage mutuel homme-IA
=========================================
*/

// SYSTÈME BIDIRECTIONNEL AVEC APPRENTISSAGE MUTUEL
class BidirectionalAI {
    constructor() {
        this.mode = null; // 'ai-guesses' ou 'human-guesses'
        this.debugMode = false;
        this.aiKnowledge = new Map();
        this.questionHistory = [];
        this.currentSecret = null;
        this.aiQuestionCount = 0;
        this.humanQuestionCount = 0;
        this.learnedPatterns = [];
        
        // Base de données des secrets que l'IA peut choisir (ÉLARGIE!)
        this.aiSecrets = [
            { item: "chat", category: "animal", characteristics: ["vivant", "domestique", "4_pattes", "poils", "miaule"] },
            { item: "voiture", category: "objet", characteristics: ["artificiel", "transport", "roues", "métal", "moteur"] },
            { item: "ordinateur", category: "objet", characteristics: ["électronique", "écran", "travail", "clavier", "artificiel"] },
            { item: "arbre", category: "vivant", characteristics: ["vivant", "grand", "nature", "feuilles", "bois"] },
            { item: "téléphone", category: "objet", characteristics: ["électronique", "portable", "communication", "écran", "artificiel"] },
            { item: "chien", category: "animal", characteristics: ["vivant", "domestique", "4_pattes", "poils", "aboie"] },
            { item: "avion", category: "objet", characteristics: ["artificiel", "transport", "vole", "grand", "métal"] },
            { item: "livre", category: "objet", characteristics: ["artificiel", "papier", "lire", "rectangulaire", "léger"] },
            // NOUVEAUX OBJETS AJOUTÉS:
            { item: "guitare", category: "objet", characteristics: ["artificiel", "musique", "cordes", "bois", "léger"] },
            { item: "oiseau", category: "animal", characteristics: ["vivant", "ailes", "vole", "chante", "plumes"] },
            { item: "fleur", category: "vivant", characteristics: ["vivant", "coloré", "parfum", "petite", "nature"] },
            { item: "vélo", category: "objet", characteristics: ["artificiel", "transport", "2_roues", "pédale", "écologique"] },
            { item: "poisson", category: "animal", characteristics: ["vivant", "eau", "nage", "écailles", "muet"] },
            { item: "table", category: "objet", characteristics: ["artificiel", "meuble", "bois", "4_pieds", "maison"] },
            { item: "soleil", category: "nature", characteristics: ["chaud", "lumière", "grand", "jaune", "ciel"] },
            { item: "montre", category: "objet", characteristics: ["artificiel", "temps", "portable", "métal", "petit"] }
        ];
        this.lastSecret = null; // Pour éviter les répétitions
        this.useGemini = false; // Mode Gemini désactivé par défaut
    }

    // =====================================
    // MODE: L'IA DEVINE
    // =====================================
    
    startAIGuessing() {
        this.mode = 'ai-guesses';
        this.aiQuestionCount = 0;
        this.aiKnowledge.clear();
        this.questionHistory = [];
        this.debugLog("🎯 Mode IA-devine activé. L'IA va apprendre à mieux questionner.");
    }

    generateAIQuestion() {
        this.aiQuestionCount++;
        
        // Questions basées sur l'apprentissage des patterns humains
        if (this.aiQuestionCount === 1) {
            return "Est-ce que c'est quelque chose de vivant ?";
        }
        
        if (this.aiQuestionCount === 2) {
            return "Est-ce que c'est plus grand qu'un livre ?";
        }
        
        if (this.aiQuestionCount === 3) {
            if (this.aiKnowledge.get('vivant') === true) {
                return "Est-ce que c'est un animal ?";
            } else {
                return "Est-ce que c'est fait par l'homme ?";
            }
        }
        
        return this.generateSmartAIQuestion();
    }

    generateSmartAIQuestion() {
        // Questions intelligentes basées sur ce qui a été appris
        if (this.aiKnowledge.get('vivant') && this.aiKnowledge.get('animal')) {
            if (!this.aiKnowledge.has('domestique')) {
                return "Est-ce que c'est un animal domestique ?";
            }
            if (!this.aiKnowledge.has('4_pattes')) {
                return "Est-ce que ça a 4 pattes ?";
            }
            if (!this.aiKnowledge.has('miaule') && this.aiKnowledge.get('domestique')) {
                return "Est-ce que ça miaule ?";
            }
        }
        
        if (!this.aiKnowledge.get('vivant')) {
            if (!this.aiKnowledge.has('électronique')) {
                return "Est-ce que c'est électronique ?";
            }
            if (!this.aiKnowledge.has('transport')) {
                return "Est-ce que ça sert au transport ?";
            }
        }
        
        return "Est-ce que c'est quelque chose de précieux ?";
    }

    processAIAnswer(answer) {
        let currentQuestion = document.getElementById('ai-question').textContent;
        let key = this.extractQuestionKey(currentQuestion);
        
        this.aiKnowledge.set(key, answer);
        this.questionHistory.push({ question: currentQuestion, answer: answer, asker: 'ai' });
        
        this.debugLog(`IA a appris: ${key} = ${answer}`);
        this.updateKnowledgeDisplay();
    }

    // =====================================
    // MODE: VOUS DEVINEZ
    // =====================================

    startHumanGuessing() {
        this.mode = 'human-guesses';
        this.humanQuestionCount = 0;
        this.questionHistory = [];
        this.realTimeDebug = false;
        
        // L'IA choisit un secret (évite les répétitions)
        let newSecret;
        do {
            newSecret = this.aiSecrets[Math.floor(Math.random() * this.aiSecrets.length)];
        } while (this.lastSecret && newSecret.item === this.lastSecret.item && this.aiSecrets.length > 1);
        
        this.currentSecret = newSecret;
        this.lastSecret = newSecret;
        this.debugLog(`🤖 L'IA a choisi: ${this.currentSecret.item} (${this.aiSecrets.length} choix possibles)`);
        
        // Masquer le secret par défaut
        document.getElementById('secret-display').innerHTML = 
            '<span class="thinking-indicator">quelque chose...</span>';
        
        // Initialiser l'interface de réflexion
        this.updateReasoningDisplay("En attente de votre première question...");
        
        // Debug: Afficher temporairement le choix (pour vérifier la variété)
        if (this.debugMode) {
            console.log(`🎲 DEBUG: L'IA a choisi "${this.currentSecret.item}" parmi ${this.aiSecrets.length} possibilités`);
        }
    }

        async processHumanQuestion(question) {
        this.humanQuestionCount++;
        let answer;
        let reasoning;

        if (this.useGemini) {
            // Utiliser Gemini pour générer la réponse
            answer = await this.generateGeminiAnswer(question);
            reasoning = `🤖 Réponse générée par Gemini IA:\nQuestion: "${question}"\nRéponse: ${answer.toUpperCase()}`;
        } else {
            // Utiliser l'IA locale
            answer = this.generateAIAnswer(question);
            reasoning = this.generateReasoning(question, answer);
        }

        this.questionHistory.push({
            question: question,
            answer: answer,
            reasoning: reasoning,
            asker: 'human'
        });

        this.analyzeLearningPattern(question, answer);
        this.debugLog(`Humain a demandé: "${question}" → Réponse: ${answer} (${this.useGemini ? 'Gemini' : 'Local'})`);
        
        // Mettre à jour la réflexion en temps réel
        if (this.realTimeDebug) {
            this.updateReasoningDisplay(reasoning);
        }

        return answer;
    }

    async generateGeminiAnswer(question) {
        const prompt = `Tu es une IA experte dans un jeu de devinettes. 

JE PENSE À: "${this.currentSecret.item}"

QUESTION DU JOUEUR: "${question}"

INSTRUCTIONS:
- Réponds UNIQUEMENT par "oui" ou "non"
- Base-toi sur les caractéristiques réelles de "${this.currentSecret.item}"
- Sois logique et cohérent

Exemples pour un vélo:
- "Est-ce fabriqué par les humains?" → oui
- "Est-ce qu'un humain peut en avoir un?" → oui
- "Est-ce que c'est vivant?" → non

RÉPONSE POUR "${this.currentSecret.item}":`;

        try {
            const geminiResponse = await askGeminiAI(prompt);
            
            // Debug: afficher la réponse de Gemini
            console.log(`🤖 Gemini répond pour "${this.currentSecret.item}" à "${question}": "${geminiResponse}"`);
            
            if (geminiResponse && geminiResponse.toLowerCase().includes('oui')) {
                return 'oui';
            } else {
                return 'non';
            }
        } catch (error) {
            console.error('Erreur Gemini, fallback vers IA locale:', error);
            return this.generateAIAnswer(question);
        }
    }

    // =====================================
    // SYSTÈME DE RAISONNEMENT INTELLIGENT
    // =====================================

    generateReasoning(question, answer) {
        let secret = this.currentSecret;
        let reasoning = [];
        
        reasoning.push(`🤔 Question reçue: "${question}"`);
        reasoning.push(`🎯 Mon secret: ${secret.item} (${secret.category})`);
        reasoning.push(`📋 Mes caractéristiques: [${secret.characteristics.join(', ')}]`);
        reasoning.push(`---`);
        
        let q = question.toLowerCase();
        
        // Vérification directe du nom
        if (q.includes(secret.item.toLowerCase())) {
            reasoning.push(`✅ MATCH DIRECT: La question contient "${secret.item}"`);
            reasoning.push(`💬 Réponse automatique: OUI`);
            return reasoning.join('\n');
        }
        
        // Questions sur l'utilisation humaine
        if ((q.includes('humain') || q.includes('adulte') || q.includes('personne')) && 
            (q.includes('utilise') || q.includes('sert') || q.includes('avoir') || q.includes('peut'))) {
            
            reasoning.push(`🧠 ANALYSE CONTEXTUELLE: Question sur l'utilisation par les humains`);
            
            if (secret.characteristics.includes('artificiel')) {
                if (q.includes('ne') && (q.includes('sert pas') || q.includes('utilise pas'))) {
                    reasoning.push(`⚖️ LOGIQUE: Question négative détectée ("ne sert pas")`);
                    reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} SERT aux humains`);
                    reasoning.push(`✅ CONCLUSION: "ne sert pas" = FAUX → Réponse: NON`);
                } else {
                    reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} est artificiel → Créé par/pour les humains`);
                    reasoning.push(`✅ CONCLUSION: Les humains l'utilisent → Réponse: OUI`);
                }
                reasoning.push(`💬 Réponse finale: ${answer.toUpperCase()}`);
                return reasoning.join('\n');
            }
            
            if (secret.characteristics.includes('domestique')) {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} est domestique → Vit avec les humains`);
                reasoning.push(`✅ CONCLUSION: Les humains peuvent l'avoir → Réponse: OUI`);
                reasoning.push(`💬 Réponse finale: ${answer.toUpperCase()}`);
                return reasoning.join('\n');
            }
        }
        
        // Questions sur l'âge/adulte
        if (q.includes('adulte') && (q.includes('avoir') || q.includes('peut'))) {
            reasoning.push(`🧠 ANALYSE: Question sur la possession par un adulte`);
            if (secret.characteristics.includes('artificiel')) {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} est un objet artificiel`);
                reasoning.push(`✅ CONCLUSION: Un adulte peut le posséder/acheter → Réponse: OUI`);
            } else if (secret.characteristics.includes('domestique')) {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} est un animal domestique`);
                reasoning.push(`✅ CONCLUSION: Un adulte peut l'adopter → Réponse: OUI`);
            } else {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} n'est ni un objet ni domestique`);
                reasoning.push(`❌ CONCLUSION: Difficile à "posséder" → Réponse: NON`);
            }
            reasoning.push(`💬 Réponse finale: ${answer.toUpperCase()}`);
            return reasoning.join('\n');
        }
        
        // Questions sur l'utilité
        if (q.includes('sert') || q.includes('utile') || q.includes('utilise')) {
            reasoning.push(`🧠 ANALYSE: Question sur l'utilité/fonction`);
            if (secret.characteristics.includes('électronique')) {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} est électronique → Outil technologique`);
                reasoning.push(`✅ CONCLUSION: Très utile dans la vie moderne → Réponse: OUI`);
            } else if (secret.characteristics.includes('transport')) {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} sert au transport`);
                reasoning.push(`✅ CONCLUSION: Fonction essentielle → Réponse: OUI`);
            } else if (secret.characteristics.includes('lire')) {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} sert à lire/apprendre`);
                reasoning.push(`✅ CONCLUSION: Outil éducatif → Réponse: OUI`);
            } else if (secret.category === 'animal' && secret.characteristics.includes('domestique')) {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} est un compagnon domestique`);
                reasoning.push(`✅ CONCLUSION: Utile pour la compagnie → Réponse: OUI`);
            } else {
                reasoning.push(`🔍 RAISONNEMENT: Un ${secret.item} n'a pas d'utilité directe évidente`);
                reasoning.push(`❌ CONCLUSION: Pas vraiment "utile" au sens pratique → Réponse: NON`);
            }
            reasoning.push(`💬 Réponse finale: ${answer.toUpperCase()}`);
            return reasoning.join('\n');
        }
        
        // ANALYSE CLASSIQUE (fallback)
        reasoning.push(`🔍 ANALYSE CLASSIQUE par mots-clés:`);
        return this.processClassicKeywordAnalysis(q, reasoning, answer);
    }

    processClassicKeywordAnalysis(q, reasoning, answer) {
        let secret = this.currentSecret;
        let matchedCharacteristic = null;
        
        if (q.includes('vivant')) {
            matchedCharacteristic = 'vivant';
            reasoning.push(`🔍 Mot-clé détecté: "vivant" → Je cherche '${matchedCharacteristic}'`);
        } else if (q.includes('animal')) {
            reasoning.push(`🔍 Mot-clé détecté: "animal" → Je vérifie si ma catégorie est 'animal'`);
        } else if (q.includes('grand') || q.includes('gros')) {
            matchedCharacteristic = 'grand';
            reasoning.push(`🔍 Mot-clé détecté: "grand/gros" → Je cherche '${matchedCharacteristic}'`);
        } else if (q.includes('domestique')) {
            matchedCharacteristic = 'domestique';
            reasoning.push(`🔍 Mot-clé détecté: "domestique" → Je cherche '${matchedCharacteristic}'`);
        } else if (q.includes('pattes')) {
            matchedCharacteristic = '4_pattes';
            reasoning.push(`🔍 Mot-clé détecté: "pattes" → Je cherche '${matchedCharacteristic}'`);
        } else if (q.includes('électronique')) {
            matchedCharacteristic = 'électronique';
            reasoning.push(`🔍 Mot-clé détecté: "électronique" → Je cherche '${matchedCharacteristic}'`);
        } else {
            reasoning.push(`❓ Aucun mot-clé reconnu → Je réponds par défaut 'non'`);
        }
        
        // Logique de décision
        if (matchedCharacteristic) {
            let hasCharacteristic = secret.characteristics.includes(matchedCharacteristic);
            reasoning.push(`✅ Vérification: ${matchedCharacteristic} ${hasCharacteristic ? 'TROUVÉ' : 'NON TROUVÉ'}`);
            reasoning.push(`💬 Réponse: ${hasCharacteristic ? 'OUI' : 'NON'}`);
        } else if (q.includes('animal')) {
            let isAnimal = secret.category === 'animal';
            reasoning.push(`✅ Vérification: Ma catégorie est '${secret.category}' ${isAnimal ? '→ OUI' : '→ NON'}`);
        } else {
            reasoning.push(`❌ Aucune correspondance → Réponse par défaut: NON`);
        }
        
        reasoning.push(`🎲 Difficulté estimée: ${this.estimateDifficulty(q)}/5`);
        return reasoning.join('\n');
    }

    // =====================================
    // LOGIQUE DE RÉPONSE CONTEXTUELLE
    // =====================================

    generateAIAnswer(question) {
        let q = question.toLowerCase();
        let secret = this.currentSecret;
        
        // Vérifications directes du nom de l'objet
        if (q.includes(secret.item.toLowerCase())) {
            return 'oui';
        }
        
        // Questions sur l'utilisation par les humains
        if ((q.includes('humain') || q.includes('adulte') || q.includes('personne') || q.includes('gens')) && 
            (q.includes('utilise') || q.includes('sert') || q.includes('avoir') || q.includes('possède') || q.includes('peut'))) {
            
            if (secret.characteristics.includes('artificiel')) {
                if (q.includes('ne') && (q.includes('sert pas') || q.includes('utilise pas'))) {
                    return 'non';
                }
                return 'oui';
            }
            
            if (secret.characteristics.includes('domestique')) {
                return 'oui';
            }
            
            if (secret.category === 'animal' && !secret.characteristics.includes('domestique')) {
                return 'non';
            }
            if (secret.category === 'vivant' && secret.item === 'arbre') {
                return 'non';
            }
            
            return 'oui';
        }
        
        // Questions sur l'âge/adulte
        if (q.includes('adulte') && (q.includes('avoir') || q.includes('utilise') || q.includes('peut'))) {
            if (secret.characteristics.includes('artificiel') || secret.characteristics.includes('domestique')) {
                return 'oui';
            }
            return 'non';
        }
        
        // Questions sur l'utilité/fonction
        if (q.includes('sert') || q.includes('utile') || q.includes('utilise')) {
            if (secret.characteristics.includes('transport') || 
                secret.characteristics.includes('électronique') || 
                secret.characteristics.includes('lire') ||
                (secret.category === 'animal' && secret.characteristics.includes('domestique'))) {
                return 'oui';
            }
            return 'non';
        }
        
        return this.processStandardCharacteristics(q, secret);
    }

    processStandardCharacteristics(q, secret) {
        // Logique standard basée sur les caractéristiques
        const characteristicMap = {
            'vivant': 'vivant',
            'grand': 'grand', 'gros': 'grand',
            'petit': '!grand',
            'fabriqué': 'artificiel', 'fabrique': 'artificiel', 'artificiel': 'artificiel',
            'naturel': '!artificiel',
            'domestique': 'domestique',
            'sauvage': '!domestique',
            'pattes': '4_pattes',
            'miaule': 'miaule',
            'aboie': 'aboie',
            'électronique': 'électronique', 'electronique': 'électronique',
            'transport': 'transport', 'déplace': 'transport', 'bouge': 'transport',
            'roues': 'roues',
            'vole': 'vole', 'vol': 'vole',
            'métal': 'métal', 'metal': 'métal',
            'moteur': 'moteur',
            'papier': 'papier',
            'écran': 'écran', 'ecran': 'écran',
            'communication': 'communication', 'communiquer': 'communication',
            'portable': 'portable',
            'poils': 'poils', 'poil': 'poils',
            'feuilles': 'feuilles', 'feuille': 'feuilles',
            'bois': 'bois',
            'nature': 'nature',
            'rectangulaire': 'rectangulaire',
            'léger': 'léger', 'leger': 'léger',
            'lourd': '!léger',
            'lire': 'lire', 'lecture': 'lire',
            'travail': 'travail', 'travaille': 'travail',
            'clavier': 'clavier'
        };
        
        // Vérifications catégories
        if (q.includes('animal')) {
            return secret.category === 'animal' ? 'oui' : 'non';
        }
        if (q.includes('objet')) {
            return secret.category === 'objet' ? 'oui' : 'non';
        }
        
        // Vérifications caractéristiques
        for (let [keyword, characteristic] of Object.entries(characteristicMap)) {
            if (q.includes(keyword)) {
                if (characteristic.startsWith('!')) {
                    return !secret.characteristics.includes(characteristic.substring(1)) ? 'oui' : 'non';
                } else {
                    return secret.characteristics.includes(characteristic) ? 'oui' : 'non';
                }
            }
        }
        
        // Questions avec "fait" et "homme"
        if (q.includes('fait') && q.includes('homme')) {
            return secret.characteristics.includes('artificiel') ? 'oui' : 'non';
        }
        
        return 'non';
    }

    // =====================================
    // UTILITAIRES ET HELPERS
    // =====================================

    estimateDifficulty(question) {
        let q = question.toLowerCase();
        if (q.includes('vivant') || q.includes('grand')) return 1;
        if (q.includes('animal') || q.includes('objet')) return 2;
        if (q.includes('domestique') || q.includes('électronique')) return 3;
        if (q.includes('pattes') || q.includes('roues')) return 4;
        if (q.includes('miaule') || q.includes('aboie')) return 5;
        return 3;
    }

    updateReasoningDisplay(reasoning) {
        if (this.realTimeDebug) {
            let reasoningContent = document.getElementById('reasoning-content');
            reasoningContent.innerHTML = reasoning.replace(/\n/g, '<br>');
            
            let reasoningDiv = document.getElementById('ai-reasoning');
            reasoningDiv.scrollTop = reasoningDiv.scrollHeight;
        }
    }

    analyzeLearningPattern(question, answer) {
        let pattern = {
            questionType: this.categorizeQuestion(question),
            questionNumber: this.humanQuestionCount,
            answer: answer,
            context: this.currentSecret.category
        };
        
        this.learnedPatterns.push(pattern);
        this.debugLog(`Pattern appris: ${pattern.questionType} au tour ${pattern.questionNumber}`);
    }

    categorizeQuestion(question) {
        let q = question.toLowerCase();
        if (q.includes('vivant')) return 'existence';
        if (q.includes('animal') || q.includes('plante')) return 'category_living';
        if (q.includes('grand') || q.includes('petit') || q.includes('taille')) return 'size';
        if (q.includes('couleur')) return 'appearance';
        if (q.includes('domestique') || q.includes('sauvage')) return 'domestication';
        if (q.includes('pattes') || q.includes('ailes')) return 'body_parts';
        if (q.includes('son') || q.includes('bruit') || q.includes('miaule') || q.includes('aboie')) return 'sounds';
        if (q.includes('électronique') || q.includes('technologie')) return 'technology';
        if (q.includes('transport') || q.includes('déplace')) return 'function_transport';
        if (q.includes('maison') || q.includes('dehors')) return 'location';
        return 'other';
    }

    extractQuestionKey(question) {
        let q = question.toLowerCase();
        if (q.includes('vivant')) return 'vivant';
        if (q.includes('animal')) return 'animal';
        if (q.includes('grand')) return 'grand';
        if (q.includes('homme') || q.includes('fait')) return 'artificiel';
        if (q.includes('domestique')) return 'domestique';
        if (q.includes('pattes')) return '4_pattes';
        if (q.includes('miaule')) return 'miaule';
        if (q.includes('aboie')) return 'aboie';
        if (q.includes('électronique')) return 'électronique';
        if (q.includes('transport')) return 'transport';
        return 'autre';
    }

    debugLog(message) {
        if (this.debugMode) {
            let debugContent = document.getElementById('debug-content');
            let timestamp = new Date().toLocaleTimeString();
            debugContent.innerHTML += `<br>[${timestamp}] ${message}`;
            debugContent.scrollTop = debugContent.scrollHeight;
        }
    }

    updateKnowledgeDisplay() {
        if (this.debugMode) {
            let knowledge = '';
            for (let [key, value] of this.aiKnowledge) {
                knowledge += `${key}: ${value}, `;
            }
            document.getElementById('knowledge-content').textContent = 
                knowledge || 'Aucune connaissance encore acquise...';
        }
    }
}

// =====================================
// INSTANCE PRINCIPALE DE L'IA
// =====================================

let bidirectionalAI = new BidirectionalAI();

// =====================================
// FONCTIONS DE NAVIGATION
// =====================================

function toggleDebug() {
    bidirectionalAI.debugMode = !bidirectionalAI.debugMode;
    let debugPanel = document.getElementById('debug-panel');
    let knowledgePanel = document.getElementById('ai-knowledge-panel');
    
    if (bidirectionalAI.debugMode) {
        debugPanel.classList.remove('hidden');
        knowledgePanel.classList.remove('hidden');
        bidirectionalAI.debugLog("🔧 Mode debug activé");
    } else {
        debugPanel.classList.add('hidden');
        knowledgePanel.classList.add('hidden');
    }
}

function startAIGuessing() {
    bidirectionalAI.startAIGuessing();
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('ai-guessing-mode').classList.remove('hidden');
}

function startHumanGuessing() {
    bidirectionalAI.startHumanGuessing();
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('human-guessing-mode').classList.remove('hidden');
}

function backToModeSelection() {
    document.getElementById('ai-guessing-mode').classList.add('hidden');
    document.getElementById('human-guessing-mode').classList.add('hidden');
    document.getElementById('mode-selection').classList.remove('hidden');
}

// =====================================
// FONCTIONS MODE IA-DEVINE
// =====================================

function startAIQuestioning() {
    let question = bidirectionalAI.generateAIQuestion();
    document.getElementById('ai-question').textContent = question;
    document.getElementById('ai-answer-buttons').innerHTML = `
        <button class="yes-btn" onclick="answerAI(true)">OUI</button>
        <button class="no-btn" onclick="answerAI(false)">NON</button>
        <button class="restart-btn" onclick="resetAIGuessing()">Restart</button>
    `;
}

function answerAI(answer) {
    bidirectionalAI.processAIAnswer(answer);
    
    setTimeout(() => {
        if (bidirectionalAI.aiQuestionCount < 10) {
            let nextQuestion = bidirectionalAI.generateAIQuestion();
            document.getElementById('ai-question').textContent = nextQuestion;
        } else {
            document.getElementById('ai-question').textContent = 
                "J'ai posé 10 questions. Pouvez-vous me dire ce que c'était pour que j'apprenne ?";
            document.getElementById('ai-answer-buttons').innerHTML = `
                <button class="restart-btn" onclick="resetAIGuessing()">Nouvelle partie</button>
            `;
        }
    }, 1000);
}

function resetAIGuessing() {
    bidirectionalAI.startAIGuessing();
    document.getElementById('ai-question').textContent = 
        "Prêt ? Cliquez sur \"Commencer\" pour que l'IA commence à deviner !";
    document.getElementById('ai-answer-buttons').innerHTML = `
        <button class="send-btn" onclick="startAIQuestioning()">Commencer</button>
    `;
}

// =====================================
// FONCTIONS MODE HUMAIN-DEVINE
// =====================================

function handleQuestionKeyPress(event) {
    if (event.key === 'Enter') {
        askAI();
    }
}

async function askAI() {
    let questionInput = document.getElementById('human-question');
    let question = questionInput.value.trim();

    if (!question) {
        alert('Veuillez taper une question !');
        return;
    }
    
    // Désactiver le bouton pendant le traitement
    let sendButton = document.querySelector('.send-btn');
    sendButton.disabled = true;
    sendButton.textContent = 'Réflexion...';
    
    let answer = await bidirectionalAI.processHumanQuestion(question);

    // Réactiver le bouton
    sendButton.disabled = false;
    sendButton.textContent = 'Envoyer la question';

    // Vérifier si le joueur a trouvé la bonne réponse
    let isCorrectGuess = checkIfCorrectGuess(question, bidirectionalAI.currentSecret);

    // Ajouter à l'historique
    let chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
        <div class="chat-message human-message">
            <strong>Vous:</strong> ${question}
        </div>
        <div class="chat-message ai-message">
            <strong>IA:</strong> ${answer.toUpperCase()} ${bidirectionalAI.useGemini ? '🤖' : '🧠'}
        </div>
    `;

    // Si le joueur a trouvé, afficher la victoire
    if (isCorrectGuess) {
        showVictoryMessage(bidirectionalAI.currentSecret, bidirectionalAI.humanQuestionCount);
        return;
    }

    // Vider le champ de saisie
    questionInput.value = '';
    questionInput.focus();

    // Faire défiler vers le bas
    let chatHistory = document.getElementById('chat-history');
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// =====================================
// FONCTIONS DE DÉTECTION DE VICTOIRE
// =====================================

function checkIfCorrectGuess(question, secret) {
    let q = question.toLowerCase();
    let secretItem = secret.item.toLowerCase();
    
    // Vérifications directes et avec variations
    if (q.includes(secretItem) ||
        (q.includes('tu penses à') && q.includes(secretItem)) ||
        (q.includes('est-ce') && q.includes(secretItem)) ||
        (q.includes('c\'est') && q.includes(secretItem)) ||
        q.includes('un ' + secretItem) || q.includes('une ' + secretItem) ||
        q.includes('le ' + secretItem) || q.includes('la ' + secretItem)) {
        return true;
    }
    
    return false;
}

function showVictoryMessage(secret, questionCount) {
    // Masquer l'interface de jeu
    document.getElementById('human-question').style.display = 'none';
    document.querySelector('.buttons').style.display = 'none';
    
    // Afficher le message de victoire
    let chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
        <div class="chat-message ai-message" style="background: linear-gradient(135deg, #d4edda, #c3e6cb); border-left: 4px solid #28a745; animation: reveal 0.5s ease-in-out;">
            <strong>🎉 BRAVO ! 🎉</strong><br>
            <strong>Vous avez trouvé !</strong> Je pensais effectivement à <strong style="color: #28a745;">${secret.item}</strong> !<br>
            <em>Vous avez réussi en ${questionCount} questions seulement !</em><br><br>
            📊 <strong>Caractéristiques :</strong> ${secret.characteristics.join(', ')}<br>
            🏷️ <strong>Catégorie :</strong> ${secret.category}
        </div>
    `;
    
    // Révéler automatiquement le secret
    let secretDisplay = document.getElementById('secret-display');
    let secretPanel = document.getElementById('ai-secret-panel');
    secretDisplay.innerHTML = `<strong style="color: #28a745;">✅ ${secret.item}</strong>`;
    secretPanel.classList.add('secret-revealed');
    
    // Afficher les boutons de fin de partie
    let gameStatus = document.getElementById('human-game-status');
    gameStatus.innerHTML = `
        <div style="text-align: center; margin: 20px 0;">
            <h2 style="color: #28a745; margin-bottom: 15px;">🏆 VICTOIRE ! 🏆</h2>
            <p style="font-size: 1.2em; margin-bottom: 20px;">
                Félicitations ! Vous avez deviné <strong>${secret.item}</strong> en ${questionCount} questions !
            </p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button class="restart-btn" onclick="resetHumanGuessing()" style="font-size: 1.1em; padding: 15px 30px;">
                    🔄 Nouvelle Partie
                </button>
                <button class="back-btn" onclick="backToModeSelection()" style="font-size: 1.1em; padding: 15px 30px;">
                    🏠 Menu Principal
                </button>
            </div>
        </div>
    `;
    
    // Animation et scroll
    let chatHistory = document.getElementById('chat-history');
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    setTimeout(() => {
        gameStatus.style.transform = 'scale(1.05)';
        setTimeout(() => gameStatus.style.transform = 'scale(1)', 200);
    }, 100);
}

function resetHumanGuessing() {
    bidirectionalAI.startHumanGuessing();
    
    // Restaurer l'interface
    document.getElementById('human-question').style.display = 'block';
    document.querySelector('.buttons').style.display = 'grid';
    document.getElementById('human-question').value = '';
    document.getElementById('human-question').focus();
    document.getElementById('chat-messages').innerHTML = '';
    
    // Restaurer le statut de jeu
    document.getElementById('human-game-status').innerHTML = `
        🎯 L'IA a choisi quelque chose. Posez-lui des questions !
        <div style="margin-top: 10px;">
            <button class="reveal-btn" onclick="revealSecret()">👁️ RÉVÉLER LE SECRET</button>
            <button class="debug-toggle" onclick="toggleRealTimeDebug()">🔍 Réflexion Temps Réel</button>
        </div>
    `;
    
    // Réinitialiser le panneau secret
    let secretPanel = document.getElementById('ai-secret-panel');
    secretPanel.classList.remove('secret-revealed');
    
    if (bidirectionalAI.realTimeDebug) {
        bidirectionalAI.updateReasoningDisplay("Mode réflexion temps réel activé ! Posez une question pour voir...");
    }
}

// =====================================
// FONCTIONS DE DEBUG ET RÉVÉLATION
// =====================================

function revealSecret() {
    let secretPanel = document.getElementById('ai-secret-panel');
    let secretDisplay = document.getElementById('secret-display');
    
    secretDisplay.innerHTML = `<strong style="color: #d32f2f;">${bidirectionalAI.currentSecret.item}</strong>`;
    secretPanel.classList.add('secret-revealed');
    
    let characteristics = bidirectionalAI.currentSecret.characteristics.join(', ');
    secretDisplay.innerHTML += `<br><small>Caractéristiques: ${characteristics}</small>`;
    
    event.target.disabled = true;
    event.target.textContent = "✅ SECRET RÉVÉLÉ";
    event.target.style.opacity = "0.6";
}

function toggleRealTimeDebug() {
    bidirectionalAI.realTimeDebug = !bidirectionalAI.realTimeDebug;
    let reasoningDiv = document.getElementById('ai-reasoning');
    
    if (bidirectionalAI.realTimeDebug) {
        reasoningDiv.style.display = 'block';
        event.target.textContent = "🔍 Masquer Réflexion";
        event.target.style.background = "linear-gradient(45deg, #4caf50, #388e3c)";
        bidirectionalAI.updateReasoningDisplay("Mode réflexion temps réel activé ! Posez une question pour voir...");
    } else {
        reasoningDiv.style.display = 'none';
        event.target.textContent = "🔍 Réflexion Temps Réel";
        event.target.style.background = "linear-gradient(45deg, #34495e, #2c3e50)";
    }
}

// =====================================
// INTÉGRATION IA GEMINI
// =====================================

async function askGeminiAI(question) {
    try {
        const response = await fetch('/api/ai/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: question })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Erreur Gemini:', error);
        return null;
    }
}

// Fonction pour basculer le mode Gemini
function toggleGeminiMode() {
    bidirectionalAI.useGemini = !bidirectionalAI.useGemini;
    let button = document.getElementById('gemini-toggle');
    
    if (bidirectionalAI.useGemini) {
        button.textContent = "🤖 Mode Gemini ✅";
        button.style.background = "linear-gradient(45deg, #4caf50, #388e3c)";
        alert("Mode Gemini activé ! L'IA utilisera maintenant Gemini pour générer ses réponses.");
    } else {
        button.textContent = "🤖 Mode Gemini";
        button.style.background = "linear-gradient(45deg, #673ab7, #9c27b0)";
        alert("Mode Gemini désactivé. Retour au mode IA local.");
    }
} 