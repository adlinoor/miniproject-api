"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardSummary = exports.updateProfile = exports.getProfile = void 0;
const userService = __importStar(require("../services/user.service"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinary_service_1 = require("../services/cloudinary.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Schema validasi update profil
const updateSchema = zod_1.z.object({
    first_name: zod_1.z.string().optional(),
    last_name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
    profilePicture: zod_1.z.string().optional(),
});
// Ambil profil user yang login
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = yield userService.getUserById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const referralCount = yield prisma_1.default.user.count({
            where: { referredBy: user.referralCode },
        });
        res.status(200).json(Object.assign(Object.assign({}, user), { referralCount }));
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
// Update profil user
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const validatedData = updateSchema.parse(req.body);
        if (validatedData.password) {
            validatedData.password = yield bcrypt_1.default.hash(validatedData.password, 10);
        }
        if (req.file) {
            const profilePictureUrl = yield (0, cloudinary_service_1.uploadToCloudinary)(req.file);
            validatedData.profilePicture = profilePictureUrl;
        }
        if (req.body.removePicture === "true") {
            validatedData.profilePicture = "";
        }
        const updatedUser = yield userService.updateUser(userId, validatedData);
        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
// Ambil ringkasan reward pengguna
const getRewardSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const summary = yield userService.getUserRewardSummary(userId);
        res.status(200).json(summary);
    }
    catch (error) {
        next(error);
    }
});
exports.getRewardSummary = getRewardSummary;
