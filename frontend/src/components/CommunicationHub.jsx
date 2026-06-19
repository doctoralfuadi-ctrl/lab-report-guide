import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Phone, Video, Mic, Image as ImageIcon, Send, Crown, Sparkles,
  Stethoscope, ArrowRight, Lock, X, PhoneOff, VideoOff, Square, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";