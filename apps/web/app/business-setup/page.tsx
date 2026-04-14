"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Check, 
    ChevronRight, 
    ChevronLeft, 
    Store, 
    CreditCard, 
    Zap, 
    ShieldCheck, 
    Loader2, 
    Building2,
    Phone,
    MapPin,
    TextQuote,
    Mail,
    Map,
    Globe
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { City } from '../../types/api';

interface Question {
    id: string;
    category: string;
    question: string;
    options: string[];
}

export default function BusinessSetupWizard() {
    const { user, syncProfile } = useAuth();
    const router = useRouter();
    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [allCities, setAllCities] = useState<City[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); 
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [completed, setCompleted] = useState(false);

    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        businessName: '',
        businessEmail: '',
        businessPhone: '',
        businessAddress: '',
        country: 'Pakistan', 
        city: '',
        state: '',
        bio: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                if (user && user.role !== 'vendor') {
                    router.push('/');
                    return;
                }

                // Initial fetch: Status, Profile, Questions, Cities, Countries
                const [status, profile, qData, cData, countryData] = await Promise.all([
                    api.businessSetup.getStatus(),
                    api.vendors.getProfile(),
                    api.businessSetup.getQuestions(),
                    api.cities.getAll(),
                    api.cities.getSupportedCountries()
                ]);

                if (status.isCompleted) {
                    router.push('/vendor/dashboard');
                    return;
                }

                setAllCities(cData);
                setQuestions(qData);
                
                const countryList = countryData.map((c: any) => c.country);
                setCountries(countryList.length > 0 ? countryList : ['Pakistan', 'India', 'UAE', 'Saudi Arabia', 'UK', 'USA', 'Canada', 'Australia']);

                // Pre-fill location data (Exclusively from Business Setup attributes)
                const initialCountry = status.answers['country']?.[0] || 'Pakistan';
                const initialCity = status.answers['city']?.[0] || '';
                const initialState = status.answers['state']?.[0] || '';

                setBasicInfo({
                    businessName: profile.businessName || '',
                    businessEmail: profile.businessEmail || user?.email || '',
                    businessPhone: profile.businessPhone || user?.phone || '',
                    businessAddress: profile.businessAddress || '',
                    country: initialCountry,
                    city: initialCity,
                    state: initialState,
                    bio: profile.bio || ''
                });

                // Filter cities based on initial country
                setFilteredCities(cData.filter(c => c.country === initialCountry));
                
                // Initialize answers state with ALL existing answers (questions + location)
                setAnswers(status.answers || {});
            } catch (err) {
                console.error('Failed to load initial data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [user, router]);

    // Update filtered cities when country changes
    useEffect(() => {
        const filtered = allCities.filter(c => c.country === basicInfo.country);
        setFilteredCities(filtered);
    }, [basicInfo.country, allCities]);

    const handleOptionToggle = (questionId: string, option: string) => {
        setAnswers(prev => {
            const currentOptions = prev[questionId] || [];
            if (currentOptions.includes(option)) {
                return { ...prev, [questionId]: currentOptions.filter(o => o !== option) };
            } else {
                return { ...prev, [questionId]: [...currentOptions, option] };
            }
        });
    };

    const nextStep = async () => {
        if (currentStep === 0) {
            // Validate basic info
            if (!basicInfo.businessName || !basicInfo.businessPhone || !basicInfo.businessEmail || !basicInfo.city || !basicInfo.country) {
                alert('Please fill in all required fields (Name, Email, Phone, Country, and City)');
                return;
            }
            
            setSaving(true);
            try {
                // 1. Update Core Vendor Profile
                await api.vendors.updateProfile({
                    businessName: basicInfo.businessName,
                    businessEmail: basicInfo.businessEmail,
                    businessPhone: basicInfo.businessPhone,
                    businessAddress: basicInfo.businessAddress,
                    bio: basicInfo.bio
                });

                // 2. Prepare location attributes
                const locationAttributes = {
                    'country': [basicInfo.country],
                    'city': [basicInfo.city],
                    'state': [basicInfo.state]
                };

                // 3. Save to backend
                await api.businessSetup.saveAnswers({
                    ...answers,
                    ...locationAttributes
                });

                // 4. IMPORTANT: Update frontend state so future steps include these!
                setAnswers(prev => ({
                    ...prev,
                    ...locationAttributes
                }));

            } catch (err) {
                console.error('Failed to update basic info:', err);
                alert('Error saving information. Please try again.');
                setSaving(false);
                return; // Stop navigation if save fails
            } finally {
                setSaving(false);
            }
        }

        if (currentStep < questions.length) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // Success call: Save final state of answers
            await api.businessSetup.saveAnswers(answers);
            await syncProfile();
            setCompleted(true);
            setTimeout(() => {
                router.push('/vendor/dashboard');
            }, 2000);
        } catch (err) {
            console.error('Failed to save answers:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    const totalSteps = questions.length + 1;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Basic Info': return <Building2 className="w-6 h-6" />;
            case 'Service Mode': return <Store className="w-6 h-6" />;
            case 'Payment Methods': return <CreditCard className="w-6 h-6" />;
            case 'Business Features': return <Zap className="w-6 h-6" />;
            default: return <ShieldCheck className="w-6 h-6" />;
        }
    };

    const renderStepContent = () => {
        if (currentStep === 0) {
            return (
                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 leading-tight">
                        General Business Details
                        <span className="block text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider italic">Basic identity and location</span>
                    </h3>

                    <div className="space-y-6 mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Name *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text"
                                        value={basicInfo.businessName}
                                        onChange={(e) => setBasicInfo({...basicInfo, businessName: e.target.value})}
                                        placeholder="e.g. Blue Ribbon Services"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Email *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="email"
                                        value={basicInfo.businessEmail}
                                        onChange={(e) => setBasicInfo({...basicInfo, businessEmail: e.target.value})}
                                        placeholder="contact@business.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Phone *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text"
                                        value={basicInfo.businessPhone}
                                        onChange={(e) => setBasicInfo({...basicInfo, businessPhone: e.target.value})}
                                        placeholder="+92 300 1234567"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Country *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <select
                                        value={basicInfo.country}
                                        onChange={(e) => setBasicInfo({...basicInfo, country: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">State / Province</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Map className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text"
                                        value={basicInfo.state}
                                        onChange={(e) => setBasicInfo({...basicInfo, state: e.target.value})}
                                        placeholder="Punjab, Sindh, Dubai, etc."
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">City *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <select
                                        value={basicInfo.city}
                                        onChange={(e) => setBasicInfo({...basicInfo, city: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold appearance-none cursor-pointer disabled:opacity-50"
                                        disabled={!basicInfo.country}
                                    >
                                        <option value="">Select City</option>
                                        {filteredCities.map(city => (
                                            <option key={city.id} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text"
                                    value={basicInfo.businessAddress}
                                    onChange={(e) => setBasicInfo({...basicInfo, businessAddress: e.target.value})}
                                    placeholder="Street Address, Building Name..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Short Bio</label>
                            <div className="relative">
                                <div className="absolute top-4 left-4 text-slate-400">
                                    <TextQuote className="w-5 h-5" />
                                </div>
                                <textarea 
                                    rows={3}
                                    value={basicInfo.bio}
                                    onChange={(e) => setBasicInfo({...basicInfo, bio: e.target.value})}
                                    placeholder="Describe your expertise..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const currentQuestion = questions[currentStep - 1];
        if (!currentQuestion) return null;

        return (
            <div className="relative z-10">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    {getCategoryIcon(currentQuestion.category)}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-8 leading-tight">
                    {currentQuestion.question}
                    <span className="block text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider italic">(Select all that apply)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {currentQuestion.options.map((option) => {
                        const isSelected = answers[currentQuestion.id]?.includes(option);
                        return (
                            <button
                                key={option}
                                onClick={() => handleOptionToggle(currentQuestion.id, option)}
                                className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 active:scale-95 flex items-center gap-4 ${
                                    isSelected 
                                    ? 'bg-blue-50 border-blue-600 shadow-lg shadow-blue-500/10' 
                                    : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-white'
                                }`}>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </div>
                                <span className={`font-black text-sm uppercase tracking-wide transition-colors ${
                                    isSelected ? 'text-blue-700' : 'text-slate-600 group-hover:text-slate-900'
                                }`}>
                                    {option}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (completed) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <Check className="w-12 h-12 text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Setup Complete!</h1>
                <div className="mt-8 flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" /> Finalizing
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-grow py-12 px-4 italic-none">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            Business Setup Wizard
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            Personalize Your Business
                        </h1>
                        <p className="text-slate-500 font-bold text-lg">
                            Help customers find and identify your services.
                        </p>
                    </div>

                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {currentStep + 1} of {totalSteps}</p>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                    {currentStep === 0 ? 'Basic Information' : (questions[currentStep - 1]?.category || 'Setup')}
                                </h2>
                            </div>
                            <p className="text-xs font-black text-blue-600 tracking-widest">{Math.round(progress)}% COMPLETE</p>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner border border-white/50">
                            <div 
                                className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-200 p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        
                        {renderStepContent()}

                        <div className="flex items-center justify-between pt-8 border-t border-slate-100 relative z-10">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0 || saving}
                                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-0"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>

                            <button
                                onClick={nextStep}
                                disabled={saving}
                                className="flex items-center gap-3 px-10 py-4 bg-[#112D4E] hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {currentStep === totalSteps - 1 ? 'Finish Setup' : 'Continue'}
                                        {currentStep === totalSteps - 1 ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
