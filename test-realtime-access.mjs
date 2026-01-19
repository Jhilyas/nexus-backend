// Test script pour vérifier l'accès à l'API Realtime
// Exécuter avec: node test-realtime-access.mjs

const API_KEY = process.env.OPENAI_API_KEY || 'YOUR_API_KEY';

async function testRealtimeAccess() {
    console.log('🔍 Test d\'accès à l\'API OpenAI Realtime...\n');

    // Test 1: Vérifier les modèles disponibles
    console.log('1️⃣ Vérification des modèles disponibles...');
    try {
        const modelsRes = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!modelsRes.ok) {
            throw new Error(`Erreur API: ${modelsRes.status}`);
        }

        const modelsData = await modelsRes.json();
        const realtimeModels = modelsData.data.filter(m =>
            m.id.includes('realtime') || m.id.includes('gpt-4o')
        );

        console.log('   Modèles GPT-4o/Realtime trouvés:');
        realtimeModels.forEach(m => console.log(`   - ${m.id}`));

        const hasRealtime = realtimeModels.some(m => m.id.includes('realtime'));
        if (hasRealtime) {
            console.log('\n   ✅ Vous avez accès aux modèles Realtime!');
        } else {
            console.log('\n   ⚠️ Aucun modèle Realtime trouvé dans votre compte.');
            console.log('   Vous devrez peut-être demander l\'accès ou passer à un plan payant.');
        }
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
    }

    // Test 2: Essayer une connexion Realtime
    console.log('\n2️⃣ Test de connexion à l\'API Realtime...');
    try {
        const model = 'gpt-4o-realtime-preview-2024-12-17';
        const response = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/sdp'
            },
            body: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:testpassword\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:actpass\r\na=mid:0\r\na=recvonly\r\na=rtpmap:111 opus/48000/2\r\n'
        });

        console.log(`   Statut: ${response.status}`);

        if (response.ok) {
            console.log('   ✅ L\'API Realtime est accessible!');
        } else {
            const errorText = await response.text();
            console.log(`   ❌ Erreur: ${errorText.substring(0, 200)}`);

            if (response.status === 404) {
                console.log('\n   ℹ️ Le modèle gpt-4o-realtime-preview n\'est pas disponible pour votre compte.');
            } else if (response.status === 401 || response.status === 403) {
                console.log('\n   ℹ️ Problème d\'authentification ou d\'autorisation.');
            }
        }
    } catch (error) {
        console.log(`   ❌ Erreur de connexion: ${error.message}`);
    }

    // Test 3: Vérifier le TTS classique
    console.log('\n3️⃣ Test de l\'API TTS classique...');
    try {
        const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: 'Test',
                voice: 'alloy'
            })
        });

        if (ttsResponse.ok) {
            console.log('   ✅ L\'API TTS classique fonctionne! (alternative possible)');
        } else {
            console.log(`   ❌ TTS non disponible: ${ttsResponse.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
    }

    console.log('\n📋 Résumé:');
    console.log('   - Si l\'API Realtime ne fonctionne pas, on peut utiliser l\'approche "Chained"');
    console.log('   - Chained = Speech Recognition → GPT-4o → TTS');
    console.log('   - Cette alternative est plus fiable et fonctionne avec tous les comptes\n');
}

testRealtimeAccess();
