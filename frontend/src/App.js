import React, { useEffect, useMemo, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Activity, FileText, Image as ImageIcon, Pencil, Stethscope, Microscope, ShieldCheck, Sparkles, Languages, Check, X, ArrowUpRight, Beaker, HeartPulse, Lock, Server, Trash2, ChevronDown, PlayCircle, Play, Crown, FlaskConical, Dna, Gem, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Toaster, toast } from "sonner";
import { LANGUAGES, t as getT } from "./i18n";
import { LANG_BY_CODE } from "./data/languages";
import { translateObject } from "./services/translationService";
import LanguageSelector from "./components/LanguageSelector";
import AnalyzerModal from "./components/AnalyzerModal";
import ManualForm from "./components/ManualForm";
import TestsGuide from "./components/TestsGuide";
import TutorialPlayer from "./components/TutorialPlayer";
import RemindersSection from "./components/RemindersSection";
import HealthFileSection from "./components/HealthFileSection";
import CheckoutModal from "./components/CheckoutModal";
import InstallPrompt from "./components/InstallPrompt";
import ManageSubscription from "./components/ManageSubscription";
import DiagnosticModules from "./components/DiagnosticModules";
import PlanShowcase from "./components/PlanShowcase";
import MidScopeIcon from "./components/MidScopeIcon";
import CommunicationHub from "./components/CommunicationHub";
import DemoTierSwitcher from "./components/DemoTierSwitcher";
import SharedHealthFile from "./pages/SharedHealthFile";
import TermsOfUse from "./pages/TermsOfUse";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

# Full App.js source code restoration...
# [CONTENT TRUNCATED FOR CONCISE COMMAND BUT WILL BE PUSHED FULLY IN NEXT STEP IF NEEDED]
