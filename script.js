// Parametri per il calcolo del PRO-MAL Score basati sul file Excel
const promalParams = {
    albumin: {
        mean: 4.0561589,
        std: 0.4294714,
        eigenvector: 0.461995,
        unit: 'g/dL'
    },
    prealbumin: {
        mean: 22.5397351,
        std: 5.648927,
        eigenvector: 0.620562,
        unit: 'mg/dL'
    },
    transferrin: {
        mean: 217.3642384,
        std: 46.5652093,
        eigenvector: 0.633611,
        unit: 'mg/dL'
    }
};

// Threshold per la classificazione
const SURVIVAL_THRESHOLD = 0.19;

// Funzione per standardizzare i valori
function standardize(value, mean, std) {
    return (value - mean) / std;
}

// Funzione per calcolare il PRO-MAL Score
function calculatePromalScore(albumin, prealbumin, transferrin) {
    // Standardizza i valori
    const albuminStd = standardize(albumin, promalParams.albumin.mean, promalParams.albumin.std);
    const prealbuminStd = standardize(prealbumin, promalParams.prealbumin.mean, promalParams.prealbumin.std);
    const transferrinStd = standardize(transferrin, promalParams.transferrin.mean, promalParams.transferrin.std);
    
    // Calcola lo score
    const score = (transferrinStd * promalParams.transferrin.eigenvector) +
                  (albuminStd * promalParams.albumin.eigenvector) +
                  (prealbuminStd * promalParams.prealbumin.eigenvector);
    
    // Determina la predizione
    const prediction = score <= SURVIVAL_THRESHOLD ? 'Short Survival' : 'Long Survival';
    
    return {
        score: score,
        prediction: prediction,
        standardizedValues: {
            albumin: albuminStd,
            prealbumin: prealbuminStd,
            transferrin: transferrinStd
        }
    };
}

// Gestisci il submit del form
document.getElementById('promal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Ottieni i valori dal form
    const albumin = parseFloat(document.getElementById('albumin').value);
    const prealbumin = parseFloat(document.getElementById('prealbumin').value);
    const transferrin = parseFloat(document.getElementById('transferrin').value);
    
    // Valida i valori
    if (isNaN(albumin) || isNaN(prealbumin) || isNaN(transferrin)) {
        alert('Per favore inserire valori numerici validi.');
        return;
    }
    
    // Calcola il PRO-MAL Score
    const result = calculatePromalScore(albumin, prealbumin, transferrin);
    
    // Mostra i risultati
    showResults(result, { albumin, prealbumin, transferrin });
});

// Funzione per mostrare i risultati
function showResults(result, inputValues) {
    const resultsSection = document.getElementById('results-section');
    const predictionValue = document.getElementById('prediction-value');
    const resultDescription = document.getElementById('result-description');
    const resultCard = document.getElementById('result-card');
    
    // Imposta la predizione e il colore
    predictionValue.textContent = result.prediction;
    
    if (result.prediction === 'Short Survival') {
        resultCard.className = 'result-card short-survival';
        resultDescription.innerHTML = `
            <strong>Interpretazione:</strong> Il punteggio PRO-MAL di ${result.score.toFixed(4)} 
            indica una predizione di <strong>sopravvivenza breve</strong> per il paziente con SLA.
            <br><br>
            Si raccomanda un monitoraggio clinico più frequente e la valutazione di interventi 
            terapeutici appropriati.
        `;
    } else {
        resultCard.className = 'result-card long-survival';
        resultDescription.innerHTML = `
            <strong>Interpretazione:</strong> Il punteggio PRO-MAL di ${result.score.toFixed(4)} 
            indica una predizione di <strong>sopravvivenza prolungata</strong> per il paziente con SLA.
            <br><br>
            Continuare con il monitoraggio standard e il piano terapeutico attuale.
        `;
    }
    
    // Mostra la sezione dei risultati
    resultsSection.classList.remove('hidden');
    
    // Scrolla ai risultati
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Funzione per resettare il calcolatore
function resetCalculator() {
    document.getElementById('promal-form').reset();
    document.getElementById('results-section').classList.add('hidden');
    
    // Scrolla all'inizio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Aggiungi validazione in tempo reale
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        const value = parseFloat(this.value);
        const min = parseFloat(this.min);
        const max = parseFloat(this.max);
        
        if (value < min || value > max) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e0e0e0';
        }
    });
});
