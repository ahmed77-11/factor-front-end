import {combineReducers,configureStore} from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import userReducer from "./user/userSlice";
import modeReducer from "./mode/modeSlice";
import ppReducer from "./personne/PersonnePhysiqueSlice";
import pmReducer from "./personne/PersonneMoraleSlice.js";
import {persistReducer,persistStore} from "redux-persist";
import {createTransform} from "redux-persist";

const EXPIRATION_TIME = 2 * 24 * 60 * 60 * 1000;

const expireTransform = createTransform(
    // Transform inbound state (before persisting)
    (inboundState, key) => {
        return {
            ...inboundState,
            _persistedAt: Date.now(), // Add a timestamp
        };
    },
    // Transform outbound state (when rehydrating)
    (outboundState, key) => {
        if (!outboundState?._persistedAt) {
            return outboundState;
        }

        const currentTime = Date.now();
        const persistedAt = outboundState._persistedAt;

        // Check if data has expired
        if (currentTime - persistedAt > EXPIRATION_TIME) {
            console.log("State expired for key:", key);
            return undefined; // Clear expired state
        }

        return outboundState;
    },
    // Transform configuration
    { whitelist: ["user","mode"] } // Apply only to the `user` slice
);

const rootReducer = combineReducers({
    user:userReducer,
    mode:modeReducer,
    personnePhysique:ppReducer,
    personneMorale:pmReducer
});

const persistConfig = {
    key: "root",
    storage,
    version: 1,
    transforms: [expireTransform],// Add the transform
    whitelist:["user","mode"],
};
const persistedReducer = persistReducer(persistConfig,rootReducer);

export const store = configureStore({
    reducer:persistedReducer,
    middleware:(getDefaultMiddleware)=>getDefaultMiddleware({
        serializableCheck:false,
    }),
});

export const persistor = persistStore(store);