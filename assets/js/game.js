// İşlem havuzu
const operations = [
    [27, '+', 6, 33],
    [34, '+', 8, 42],
    [18, '+', 4, 22],
    [45, '+', 7, 52],
    [56, '+', 9, 65],
    [51, '-', 5, 46],
    [43, '-', 7, 36],
    [62, '-', 8, 54],
    [35, '-', 6, 29],
    [74, '-', 9, 65],
    [23, '+', 9, 32],
    [67, '+', 5, 72],
    [81, '-', 4, 77],
    [48, '+', 6, 54]
];

let currentOp = {};
let currentStep = 1;
let stats = {
    correct: 0,
    completed: 0,
    streak: 0
};

// Yeni işlem yükle
function loadNewOperation() {
    const op = operations[Math.floor(Math.random() * operations.length)];
    const [num1, operator, num2, result] = op;
    
    const isAddition = operator === '+';
    
    // Strateji adımlarını hesapla
    let nearestTen, step1Value, step2Value, firstResult;
    
    if (isAddition) {
        nearestTen = Math.ceil(num1 / 10) * 10;
        step1Value = nearestTen - num1;
        step2Value = num2 - step1Value;
        firstResult = nearestTen;
    } else {
        nearestTen = Math.floor(num1 / 10) * 10;
        step1Value = num1 - nearestTen;
        step2Value = num2 - step1Value;
        firstResult = nearestTen;
    }

    currentOp = { num1, operator, num2, result, step1Value, step2Value, firstResult, nearestTen, isAddition };
    currentStep = 1;

    // Arayüzü güncelle
    document.getElementById('operation-display').textContent = `${num1} ${operator} ${num2}`;
    document.getElementById('main-feedback').textContent = '🚀 Hadi başlayalım! İlk adımı tamamla!';
    document.getElementById('next-btn').style.display = 'none';

    // Adımları sıfırla
    for (let i = 1; i <= 3; i++) {
        const stepCard = document.getElementById(`step-${i}`);
        const input = document.getElementById(`input-${i}`);
        const feedback = document.getElementById(`feedback-${i}`);
        const hint = document.getElementById(`hint-${i}`);
        
        stepCard.classList.remove('active', 'completed', 'disabled');
        if (i > 1) stepCard.classList.add('disabled');
        else stepCard.classList.add('active');
        
        input.value = '';
        input.disabled = i > 1;
        feedback.textContent = '';
        feedback.className = 'feedback-inline';
        hint.classList.remove('show');
    }

    // Açıklamaları güncelle
    updateDescriptions();
}

// Açıklamaları güncelle (Görselleştirme İpuçları Eklendi)
function updateDescriptions() {
    const { num1, num2, nearestTen, isAddition, step1Value, step2Value } = currentOp;
    
    // Adım 1 Açıklaması
    const step1Desc = isAddition
        ? `İlk sayıyı (${num1}) <span class="visual-cue">10'lu Bloklarla</span> düşün. ${nearestTen}'a ulaşmak için ${num2} sayısından kaç <span class="visual-cue">tekli küp</span> almalısın?`
        : `İlk sayıyı (${num1}) <span class="visual-cue">10'lu Bloklarla</span> düşün. ${nearestTen}'a geri zıplamak için kaç <span class="visual-cue">tekli küp</span> çıkarmalısın?`;

    // Adım 2 Açıklaması
    const step2Desc = isAddition
        ? `Toplam ${num2} ekleyecektin. ${step1Value} kullandın. Geriye kaç <span class="visual-cue">tekli küp</span> kaldı?`
        : `Toplam ${num2} çıkaracaktın. ${step1Value} kullandın. Geriye kaç <span class="visual-cue">çıkarılacak küp</span> kaldı?`;

    // Adım 3 Açıklaması
    const step3Desc = isAddition
        ? `Yeni onluk (${nearestTen})'tan kalanı (${step2Value}) ekle. <span class="visual-cue">Cevap tam bir onluk mu, yoksa bir onluk ve tekli küp mü?</span> Sonuç nedir?`
        : `Yeni onluk (${nearestTen})'tan kalanı (${step2Value}) çıkar. <span class="visual-cue">Bu, bir 10'lu bloğu açman gerektiği anlamına gelebilir.</span> Sonuç nedir?`;

    // Her iki oyun da aynı elementlere sahip olduğu için güvenle güncelleme yapabiliriz
    document.getElementById('step-1-desc').innerHTML = step1Desc;
    document.getElementById('step-2-desc').innerHTML = step2Desc;
    document.getElementById('step-3-desc').innerHTML = step3Desc;
}


// Adım kontrolü
function checkStep(step) {
    const input = document.getElementById(`input-${step}`);
    const feedback = document.getElementById(`feedback-${step}`);
    const userAnswer = parseInt(input.value);
    
    if (isNaN(userAnswer)) {
        feedback.textContent = '⚠️ Bir sayı gir!';
        feedback.className = 'feedback-inline incorrect';
        return;
    }

    let correctAnswer;
    if (step === 1) correctAnswer = currentOp.step1Value;
    else if (step === 2) correctAnswer = currentOp.step2Value;
    else if (step === 3) correctAnswer = currentOp.result;

    if (userAnswer === correctAnswer) {
        // DOĞRU CEVAP
        feedback.textContent = '✅ Doğru!';
        feedback.className = 'feedback-inline correct';
        input.disabled = true;
        
        const stepCard = document.getElementById(`step-${step}`);
        stepCard.classList.remove('active');
        stepCard.classList.add('completed');

        stats.correct++;
        stats.streak++;
        updateStats();

        if (step < 3) {
            // Sonraki adıma geç
            currentStep = step + 1;
            const nextStepCard = document.getElementById(`step-${currentStep}`);
            nextStepCard.classList.remove('disabled');
            nextStepCard.classList.add('active');
            document.getElementById(`input-${currentStep}`).disabled = false;
            
            const encouragements = [
                '🌟 Harika! Sonraki adıma geç!',
                '💪 Süpersin! Devam et!',
                '⭐ Mükemmel! İlerle!',
                '🎯 Aferin! Bir adım daha!'
            ];
            document.getElementById('main-feedback').textContent = 
                encouragements[Math.floor(Math.random() * encouragements.length)];
        } else {
            // Oyun tamamlandı
            stats.completed++;
            updateStats();
            document.getElementById('main-feedback').textContent = 
                '🎉 Tebrikler! İşlemi zihinsel stratejiyle tamamladın!';
            document.getElementById('next-btn').style.display = 'block';
            showCelebration();
        }
    } else {
        // YANLIŞ CEVAP
        feedback.textContent = '❌ Yanlış. Tekrar dene!';
        feedback.className = 'feedback-inline incorrect';
        stats.streak = 0;
        updateStats();
        document.getElementById('main-feedback').textContent = 
            '🤔 Dikkatli düşün! İpucu istersen butona tıkla.';
    }
}

// İstatistikleri güncelle
function updateStats() {
    document.getElementById('correct-count').textContent = stats.correct;
    document.getElementById('completed-count').textContent = stats.completed;
    document.getElementById('streak-count').textContent = stats.streak;
}

// İpucu göster
function showHint() {
    const hintBox = document.getElementById(`hint-${currentStep}`);
    
    let hintText = '';
    if (currentStep === 1) {
        hintText = currentOp.isAddition
            ? `💡 İpucu: ${currentOp.num1} + ${currentOp.step1Value} = ${currentOp.nearestTen}`
            : `💡 İpucu: ${currentOp.num1} - ${currentOp.step1Value} = ${currentOp.nearestTen}`;
    } else if (currentStep === 2) {
        hintText = `💡 İpucu: ${currentOp.num2} - ${currentOp.step1Value} = ${currentOp.step2Value}`;
    } else if (currentStep === 3) {
        hintText = currentOp.isAddition
            ? `💡 İpucu: ${currentOp.nearestTen} + ${currentOp.step2Value} = ${currentOp.result}`
            : `💡 İpucu: ${currentOp.nearestTen} - ${currentOp.step2Value} = ${currentOp.result}`;
    }
    
    hintBox.textContent = hintText;
    hintBox.classList.add('show');
}

// Kutlama göster
function showCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.innerHTML = `
        <div class="celebration-emoji">🎊🏆🎉</div>
        <h2>Harika İş!</h2>
        <p>Zihinsel matematik stratejisini<br>başarıyla kullandın! 🌟</p>
        <button class="control-btn next" onclick="this.parentElement.remove()">
            Devam Et 🚀
        </button>
    `;
    document.body.appendChild(celebration);
    // Kutlama modalının kendiliğinden kapanmasını istemediğimiz için setTimeout kaldırıldı.
}

/* ------------------------------------------------------------------ */
/* STRATEJİ MODU (STRATEJI.HTML) İÇİN ÖZEL MODAL FONKSİYONLARI */
/* ------------------------------------------------------------------ */

function openModal() {
    document.getElementById('strategyModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('strategyModal').style.display = 'none';
}

// Kullanıcı ESC tuşuna veya modal dışına tıklarsa kapatma
window.onclick = function(event) {
    const modal = document.getElementById('strategyModal');
    // Sadece modal elemanına tıklanırsa kapat
    if (event.target == modal) {
        closeModal();
    }
}
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('strategyModal');
    // ESC tuşu ve modal görünürse kapat
    if (e.key === "Escape" && modal && modal.style.display === 'block') {
        closeModal();
    }
});


// Enter tuşu desteği
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById(`input-${currentStep}`);
        // Enter'a basıldığında ve input aktif ve doluysa kontrol et
        if (input && !input.disabled && input.value) {
            checkStep(currentStep);
        }
    }
});

// Oyunu başlat
loadNewOperation();