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
        prediction: prediction
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
        alert('Please insert valid numeric values.');
        return;
    }
    
    // Calcola il PRO-MAL Score
    const result = calculatePromalScore(albumin, prealbumin, transferrin);
    
    // Mostra i risultati
    showResults(result);
});

// Funzione per mostrare i risultati
function showResults(result) {
    const resultsSection = document.getElementById('results-section');
    const predictionValue = document.getElementById('prediction-value');
    const resultDescription = document.getElementById('result-description');
    const resultCard = document.getElementById('result-card');
    
    // Imposta la predizione
    predictionValue.textContent = result.prediction.toUpperCase();
    
    if (result.prediction === 'Short Survival') {
        resultCard.className = 'result-card short-survival';
        resultDescription.innerHTML = `
            Based on the entered plasmatic markers, the predictive model indicates a
            <strong>short survival</strong> prognosis for this ALS patient.
            <br><br>
            <strong>Median survival post-evaluation:</strong> 14.83 months
            <strong>1-year survival probability:</strong> 57%
            <strong>2-year survival probability:</strong> 33%
            <br><br>
            <strong>Clinical Recommendations:</strong>
            <ul style="text-align: left; margin-top: 10px;">
                <li>Intensify clinical monitoring with more frequent visits</li>
                <li>Evaluate optimization of supportive therapy</li>
                <li>Consider early discussion of advance care directives</li>
                <li>Ensure adequate psychological support for patient and family</li>
                <li>Assess need for specialized palliative care consultation</li>
            </ul>
        `;
    } else {
        resultCard.className = 'result-card long-survival';
        resultDescription.innerHTML = `
            Based on the entered plasmatic markers, the predictive model indicates a
            <strong>long survival</strong> prognosis for this ALS patient.
            <br><br>
            <strong>Median survival post-evaluation:</strong> 25.10 months
            <strong>1-year survival probability:</strong> 72%
            <strong>2-year survival probability:</strong> 53%
            <br><br>
            <strong>Clinical Recommendations:</strong>
            <ul style="text-align: left; margin-top: 10px;">
                <li>Continue with standard clinical monitoring</li>
                <li>Maintain current therapeutic plan</li>
                <li>Schedule regular follow-ups to monitor disease progression</li>
                <li>Encourage participation in rehabilitation and support programs</li>
                <li>Consider enrollment in clinical trials if appropriate</li>
            </ul>
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
