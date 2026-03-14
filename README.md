# Manufacturing App

App mobile realizzata con **React Native** (0.83) e **Expo** (SDK 55), con routing basato su **Expo Router**.

## Prerequisiti

- **Node.js** >= 20.19.4 (LTS) — se usi [nvm](https://github.com/nvm-sh/nvm), basta eseguire `nvm use` (la versione è già specificata nel file `.nvmrc`)
- **npm** (incluso con Node.js)
- **Xcode** (per il simulatore iOS) con Command Line Tools installati
- **CocoaPods** (`sudo gem install cocoapods` oppure via Homebrew)

## Installazione

```bash
# Clona il repo e installa le dipendenze
git clone <url-repo>
cd manufacturing-app
npm install
```

## Esecuzione

### iOS (simulatore)

```bash
# Simulatore di default
npx expo run:ios

# Simulatore specifico (es. iPhone 17 Pro)
npx expo run:ios --device "iPhone 17 Pro"
```

> Al primo avvio verrà eseguito il build nativo. Le successive esecuzioni saranno più rapide.

### Android (emulatore)

```bash
npx expo run:android
```

### Expo Dev Server (Expo Go / Dev Client)

```bash
npx expo start
```

Scansiona il QR code con l'app **Expo Go** oppure premi `i` per aprire il simulatore iOS o `a` per l'emulatore Android.

## Struttura del progetto

```
src/
  app/          # Route (Expo Router)
  components/   # Componenti riutilizzabili
  constants/    # Tema e costanti
  navigation/   # Navigator e tab bar
  screens/      # Schermate dell'app
  store/        # Context providers (state management)
```

## Script disponibili

| Comando         | Descrizione                          |
| --------------- | ------------------------------------ |
| `npm start`     | Avvia il dev server Expo             |
| `npm run ios`   | Build e avvio su simulatore iOS      |
| `npm run android` | Build e avvio su emulatore Android |
| `npm run web`   | Avvia la versione web                |
