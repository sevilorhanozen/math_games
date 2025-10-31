// =================================================================================
// 🎮 OYUN MODU YÖNETİMİ
// =================================================================================

// Hangi HTML dosyasının yüklendiğini kontrol eder ve modu belirler
function getCurrentGameMode() {
    const path = window.location.pathname;
    if (path.includes('strateji.html')) {
        return 'STRATEGY'; // Strateji Modu (Toplama/Çıkarma)
    } else if (path.includes('rhythmic.html')) {
        return 'RHYTHMIC'; // Ritmik Sayma Modu
    }
    // Varsayılan olarak Temel Pratik modu yerine, eğer pratik.html silindiyse strateji.html kalır.
    // Eğer pratik.html kalsaydı, buraya 'PRACTICE' eklenebilirdi.
    return 'STRATEGY'; 
}

const GAME_MODE = getCurrentGameMode();

// =================================================================================
// ⭐ TOPLAMA VE ÇIKARMA MANTIK KISMI
// =================================================================================

if (GAME_MODE === 'STRATEGY') {
    let currentOp = {};
    let currentStep = 1;
    let score = 0;
    let series = 0;

    // İşlem havuzu
    const operations = [
        // [Sayı1, İşlem, Sayı2, Sonuç, Adım1, Adım2]
        // Toplama Örnekleri (10'a tamamlama)
        [27, '+', 6, 33, 3, 3],
        [39, '+', 4, 43, 1, 3],
        [48, '+', 7, 55, 2, 5],
        // Çıkarma Örnekleri (10'dan çıkarma)
        [53, '-', 5, 48, 3, 2],
        [61, '-', 9, 52, 1, 8],
        [74, '-', 8, 66, 4, 4]
    ];

    // Rastgele bir işlem yükler
    function loadNewOperation() {
        currentStep = 1;
        
        // Rastgele bir işlem seç
        const op = operations[Math.floor(Math.random() * operations.length)];
        const [num1, operator, num2, result, step1Value, step2Value] = op;
        
        // İşlemin detaylarını hesapla
        const nearestTen = operator === '+' 
            ? Math.ceil(num1 / 10) * 10 
            : Math.floor(num1 / 10) * 10;
        
        currentOp = { 
            num1, operator, num2, result, step1Value, step2Value, nearestTen, 
            isAddition: operator === '+' 
        };

        // DOM elementlerini güncelle
        document.getElementById('operation-display').textContent = `${num1} ${operator} ${num2}`;
        document.getElementById('result-display').textContent = ' ?';
        document.getElementById('score').textContent = score;
        document.getElementById('series').textContent = series;

        // Adım 1'i başlat
        updateDescriptions();
        enableStep(1);
    }

    // Adım açıklamalarını günceller
    function updateDescriptions() {
        const descriptions = {
            1: currentOp.isAddition 
                ? `${currentOp.num1}'i ${currentOp.nearestTen}'a tamamlamak için kaç eklemelisin?` 
                : `${currentOp.num1}'den ${currentOp.nearestTen}'e inmek için kaç çıkarmalısın?`,
            2: currentOp.isAddition 
                ? `${currentOp.num2}'den ${currentOp.step1Value} kullandın. Geriye kaç kaldı?` 
                : `${currentOp.num2}'den ${currentOp.step1Value} kullandın. Geriye kaç kaldı?`,
            3: currentOp.isAddition 
                ? `${currentOp.nearestTen} + ${currentOp.step2Value} işleminin sonucu nedir?` 
                : `${currentOp.nearestTen} - ${currentOp.step2Value} işleminin sonucu nedir?`,
        };

        document.getElementById('step-1-desc').textContent = descriptions[1];
        document.getElementById('step-2-desc').textContent = descriptions[2];
        document.getElementById('step-3-desc').textContent = descriptions[3];
    }

    // İlgili adımı aktifleştirir ve diğerlerini devre dışı bırakır
    function enableStep(step) {
        currentStep = step;
        for (let i = 1; i <= 3; i++) {
            const input = document.getElementById(`input-${i}`);
            input.disabled = (i !== step);
            input.classList.remove('error', 'success');
            if (i === step) {
                input.value = '';
                input.focus();
            }
        }
    }

    // Adım cevabını kontrol eder
    function checkStep(step) {
        const input = document.getElementById(`input-${step}`);
        const userValue = parseInt(input.value);
        let expectedValue;
        let isCorrect = false;

        if (step === 1) {
            expectedValue = currentOp.step1Value;
        } else if (step === 2) {
            expectedValue = currentOp.step2Value;
        } else if (step === 3) {
            expectedValue = currentOp.result;
        }

        if (userValue === expectedValue) {
            isCorrect = true;
            input.classList.add('success');
            input.disabled = true;
            document.getElementById('feedback-box').textContent = '✅ Doğru! Harika gidiyorsun.';
        } else {
            input.classList.add('error');
            series = 0; // Seri bozuldu
            document.getElementById('feedback-box').textContent = '❌ Yanlış cevap! Tekrar dene.';
        }
        
        // Doğruysa bir sonraki adıma geç veya işlemi bitir
        if (isCorrect) {
            if (step < 3) {
                enableStep(step + 1);
            } else {
                score++;
                series++;
                document.getElementById('operation-display').textContent = currentOp.result;
                document.getElementById('result-display').textContent = '✅';
                document.getElementById('feedback-box').textContent = `🏆 Tebrikler! İşlem başarıyla tamamlandı. Seri: ${series}`;
                showCelebration();
                
                // Yeni işlemi gecikmeli yükle
                setTimeout(loadNewOperation, 2000);
            }
        }
    }

    // İpucu gösterir
    function showHint() {
        const hintBox = document.getElementById('feedback-box');
        let hintText = '';

        if (currentStep === 1) {
            hintText = currentOp.isAddition 
                ? `💡 İpucu: ${currentOp.num1}'e ${currentOp.step1Value} ekleyince ${currentOp.nearestTen} olur.`
                : `💡 İpucu: ${currentOp.num1}'den ${currentOp.step1Value} çıkarınca ${currentOp.nearestTen} olur.`;
        } else if (currentStep === 2) {
            hintText = `💡 İpucu: ${currentOp.num2} - ${currentOp.step1Value} işleminin sonucu ${currentOp.step2Value}'dir.`;
        } else if (currentStep === 3) {
            hintText = currentOp.isAddition
                ? `💡 İpucu: ${currentOp.nearestTen} + ${currentOp.step2Value} = ${currentOp.result}`
                : `💡 İpucu: ${currentOp.nearestTen} - ${currentOp.step2Value} = ${currentOp.result}`;
        }
        
        hintBox.textContent = hintText;
        // Hata sınıfını kaldırıp sadece metin bırakır
        hintBox.classList.remove('error'); 
        hintBox.classList.add('info');
    }

    // Kutlama göster
    function showCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.innerHTML = `
            <div class="celebration-emoji">🎉🏆🌟</div>
            <h2>Harika İş!</h2>
            <p>Zihinsel matematik stratejisini<br>başarıyla kullandın! 🚀</p>
            <button class="control-btn next" onclick="this.parentElement.remove()">
                Devam Et ➡️
            </button>
        `;
        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 4000);
    }
    
    // Strateji Modal Fonksiyonları (Sadece strateji.html için)
    function openModal() {
        document.getElementById('strategyModal').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('strategyModal').style.display = 'none';
    }

    if (GAME_MODE === 'STRATEGY') {
        window.onclick = function(event) {
            const modal = document.getElementById('strategyModal');
            if (event.target == modal) {
                closeModal();
            }
        }
        document.addEventListener('keydown', function(e) {
            if (e.key === "Escape" && document.getElementById('strategyModal').style.display === 'block') {
                closeModal();
            }
        });
    }

    // Olay Dinleyicileri
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const input = document.getElementById(`input-${currentStep}`);
            if (input && !input.disabled && input.value) {
                checkStep(currentStep);
            }
        }
    });

    // Sayfa yüklendiğinde başlat
    document.addEventListener('DOMContentLoaded', () => {
        loadNewOperation();
        // Global fonksiyonları window objesine ekle
        window.checkStep = checkStep;
        window.showHint = showHint;
        if (GAME_MODE === 'STRATEGY') {
            window.openModal = openModal;
            window.closeModal = closeModal;
        }
    });

}

// =================================================================================
// 🎶 RİTMİK SAYMA MANTIK KISMI
// =================================================================================

else if (GAME_MODE === 'RHYTHMIC') {
    const board = document.getElementById('number-board');
    const rhythmSelect = document.getElementById('rhythm-select');
    const startBtn = document.getElementById('start-btn');
    const clearBtn = document.getElementById('clear-btn');
    const hintBtn = document.getElementById('hint-btn');
    const feedback = document.getElementById('feedback');
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');

    let selectedRhythm = 0;
    let markedCells = {}; // {2: ['green', 'red']}
    let correctCount = 0;
    let totalRhythmicNumbers = 0;
    let hintUsed = false;

    // 1'den 100'e kadar tahtayı oluşturur
    function createBoard() {
        board.innerHTML = '';
        for (let i = 1; i <= 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = i;
            cell.dataset.number = i;
            board.appendChild(cell);
            
            cell.addEventListener('click', function() {
                if (selectedRhythm === 0) {
                    feedback.textContent = 'Lütfen önce bir ritmik sayma değeri seçip Başlatın.';
                    return;
                }
                handleCellClick(this);
            });
        }
    }

    // İlerleme çubuğunu ve metnini günceller
    function updateProgress() {
        const percentage = totalRhythmicNumbers > 0 ? (correctCount / totalRhythmicNumbers) * 100 : 0;
        progressText.textContent = `İlerleme: ${correctCount} / ${totalRhythmicNumbers}`;
        progressFill.style.width = `${percentage}%`;

        if (correctCount > 0 && correctCount === totalRhythmicNumbers && totalRhythmicNumbers > 0) {
            feedback.className = 'feedback success';
            feedback.textContent = `🎉 Tebrikler! ${selectedRhythm}'şer ritmik saymayı başarıyla tamamladın!`;
            // Kutlama göster
            const celebration = document.createElement('div');
            celebration.className = 'celebration rhythmic-celeb';
            celebration.innerHTML = `
                <div class="celebration-emoji">🎊🌟</div>
                <h2>Mükemmel!</h2>
                <p>${selectedRhythm}'şer ritmik saymayı bitirdin! 🎉</p>
                <button class="control-btn next" onclick="this.parentElement.remove()">
                    Kapat ✖️
                </button>
            `;
            document.body.appendChild(celebration);
            setTimeout(() => celebration.remove(), 4000);
        }
    }

    // Hücre tıklamasını işler
    function handleCellClick(cell) {
        const num = parseInt(cell.dataset.number);
        const isRhythmic = num % selectedRhythm === 0;
        const selectedClass = 'selected-rhythm';

        // Doğru sayı mı?
        if (isRhythmic) {
            if (!markedCells[num] || !markedCells[num].includes(selectedClass)) {
                // Doğru ve ilk kez işaretleniyor
                cell.classList.add(selectedClass);
                correctCount++;
                
                markedCells[num] = markedCells[num] || [];
                if (!markedCells[num].includes(selectedClass)) {
                    markedCells[num].push(selectedClass);
                }

                feedback.className = 'feedback success';
                feedback.textContent = `✅ Harika! ${num}, ${selectedRhythm}'ün bir katı.`;
            } else {
                feedback.className = 'feedback info';
                feedback.textContent = `Bu sayıyı zaten bulmuştun! Başka bir sayı dene.`;
            }
        } else {
            // Yanlış sayı
            if (!cell.classList.contains('incorrect')) {
                cell.classList.add('incorrect');
                setTimeout(() => cell.classList.remove('incorrect'), 500);
            }
            feedback.className = 'feedback error';
            feedback.textContent = `❌ ${num}, ${selectedRhythm}'ün katı değil. Bir daha düşün!`;
        }

        updateProgress();
    }
    
    // Ritmik sayma oyununu başlatır
    function startGame() {
        selectedRhythm = parseInt(rhythmSelect.value);
        correctCount = 0;
        markedCells = {};
        hintUsed = false;
        
        // Tahtayı temizle
        document.querySelectorAll('.number-cell').forEach(cell => {
            cell.className = 'number-cell';
        });

        // Toplam doğru sayıyı hesapla (100'e kadar)
        totalRhythmicNumbers = Math.floor(100 / selectedRhythm);

        feedback.className = 'feedback info';
        feedback.textContent = `${selectedRhythm}'şer ritmik sayma başladı! Tüm katları işaretle.`;
        updateProgress();
    }

    // İpucu gösterir
    function showHint() {
        if (selectedRhythm === 0) {
            feedback.textContent = 'Lütfen önce bir ritmik sayma değeri seçip Başlatın.';
            return;
        }

        if (correctCount === totalRhythmicNumbers) {
             feedback.textContent = 'Zaten tüm sayıları buldun! Yeni bir ritim seç.';
             return;
        }

        const selectedClass = 'selected-rhythm';

        for (let i = selectedRhythm; i <= 100; i += selectedRhythm) {
            const cell = document.querySelector(`[data-number="${i}"]`);
            
            // Eğer hücre henüz işaretlenmemişse ipucu ver
            if (!cell.classList.contains(selectedClass)) {
                // İpucu animasyonu
                cell.style.animation = 'pulse 1s infinite';
                feedback.className = 'feedback hint';
                feedback.textContent = `💡 İpucu: ${i} sayısına bak! ${selectedRhythm}'e tam bölünüyor!`;
                setTimeout(() => cell.style.animation = '', 1500); // 1.5 sn sonra animasyonu durdur
                hintUsed = true;
                return; // İlk bulunmayan sayıyı gösterip çık
            }
        }
        
    }


    // Olay Dinleyicileri
    document.addEventListener('DOMContentLoaded', () => {
        createBoard(); // Tahtayı oluştur
        
        // Global fonksiyonları window objesine ekle
        window.startGame = startGame;
        window.showHint = showHint;

        startBtn.addEventListener('click', startGame);
        hintBtn.addEventListener('click', showHint);
        
        // Temizle butonu
        clearBtn.addEventListener('click', () => {
            if (confirm('Tüm işaretlemeleri silmek istediğinden emin misin?')) {
                document.querySelectorAll('.number-cell').forEach(cell => {
                    cell.className = 'number-cell';
                });
                markedCells = {};
                correctCount = 0;
                updateProgress();
                feedback.className = 'feedback info';
                feedback.textContent = '🧹 Tahta temizlendi! Yeni başlangıç!';
            }
        });
        
    });

}

// =================================================================================
// 🎨 EK CSS STİLLERİ (rhythmic.html için)
// =================================================================================

// Ritmik oyunun stilini assets/css/style.css dosyasına eklemeniz gerekir.
// Bu kısım JS'de değil, CSS dosyasında olmalıdır.
// Lütfen assets/css/style.css dosyasının sonuna bu kodları ekleyin:
/*
.number-board {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 5px;
    margin-top: 20px;
}

.number-cell {
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px 0;
    text-align: center;
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
}

.number-cell:hover:not(.selected-rhythm):not(.incorrect) {
    background: #e0e0e0;
}

.selected-rhythm {
    background: linear-gradient(45deg, #43e97b, #38f9d7);
    color: white;
    border-color: #38f9d7;
    transform: scale(1.05);
}

.incorrect {
    background: #ff5e5e;
    color: white;
    animation: shake 0.5s;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(67, 233, 123, 0.7); }
    70% { box-shadow: 0 0 0 20px rgba(67, 233, 123, 0); }
    100% { box-shadow: 0 0 0 0 rgba(67, 233, 123, 0); }
}

.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
}

.control-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.control-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.3s;
}

.primary {
    background: #667eea;
    color: white;
}
.secondary {
    background: #f0f0f0;
    color: #333;
}
.info {
    background: #ffcb6b;
    color: #333;
}
.primary:hover { background: #5566cc; }
.secondary:hover { background: #e0e0e0; }
.info:hover { background: #f0b85a; }

.feedback {
    margin-top: 15px;
    padding: 10px;
    border-radius: 8px;
    font-weight: bold;
    text-align: center;
}
.feedback.info { background: #e6f7ff; color: #0056b3; }
.feedback.success { background: #d4edda; color: #155724; }
.feedback.error { background: #f8d7da; color: #721c24; }
.feedback.hint { background: #fff3cd; color: #856404; }

.progress-bar-container {
    margin-top: 20px;
    text-align: left;
}

.progress-bar {
    width: 100%;
    background-color: #eee;
    border-radius: 5px;
    height: 15px;
    overflow: hidden;
}

#progress-fill {
    height: 100%;
    background-color: #43e97b;
    transition: width 0.5s;
    border-radius: 5px;
}

#progress-text {
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
}

*/