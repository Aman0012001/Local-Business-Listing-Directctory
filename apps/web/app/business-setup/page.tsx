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
    
    // Explicit order for steps 2, 3 and 4
    const categoriesSortOrder = ['Business Features', 'Payment Methods', 'Service Mode'];
    
    const categories = Array.from(new Set(questions.map(q => q.category)))
        .sort((a, b) => {
            const indexA = categoriesSortOrder.indexOf(a);
            const indexB = categoriesSortOrder.indexOf(b);
            // If both in list, sort by list order
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only one in list, it comes first
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            // Otherwise alphabetical
            return a.localeCompare(b);
        });

    const totalSteps = categories.length + 1;

    const defaultQuestions: Question[] = [
        {
            id: 'feat-1',
            category: 'Business Features',
            question: 'What amenities or features does your business offer?',
            options: ['WiFi Available', 'Parking Space', 'Air Conditioned', 'Wheelchair Accessible', 'Waiting Area', 'Contactless Delivery']
        },
        {
            id: 'pay-1',
            category: 'Payment Methods',
            question: 'Which payment methods do you accept?',
            options: ['Cash', 'UPI / QR Code', 'Credit/Debit Card', 'Net Banking', 'Digital Wallets']
        },
        {
            id: 'srv-1',
            category: 'Service Mode',
            question: 'How do you provide your services?',
            options: ['Home Service', 'In-store / Studio', 'Online / Virtual', 'Emergency Services']
        }
    ];

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

                if (!status || !status.answers) {
                    console.warn('[BusinessSetup] Status or answers missing, using defaults.');
                }

                if (status?.isCompleted) {
                    router.push('/vendor/dashboard');
                    return;
                }

                setAllCities(cData || []);
                setQuestions(qData && qData.length > 0 ? qData : defaultQuestions);
                
                const countryList = (countryData || []).filter(Boolean).map((c: any) => c.country);
                setCountries(countryList.length > 0 ? countryList : ['Pakistan', 'India', 'UAE', 'Saudi Arabia', 'UK', 'USA', 'Canada', 'Australia']);

                // Pre-fill location data (Exclusively from Business Setup attributes)
                const safeAnswers = status?.answers || {};
                const initialCountry = safeAnswers['country']?.[0] || 'Pakistan';
                const initialCity = safeAnswers['city']?.[0] || '';
                const initialState = safeAnswers['state']?.[0] || '';

                setBasicInfo({
                    businessName: profile?.businessName || '',
                    businessEmail: profile?.businessEmail || user?.email || '',
                    businessPhone: profile?.businessPhone || user?.phone || '',
                    businessAddress: profile?.businessAddress || '',
                    country: initialCountry,
                    city: initialCity,
                    state: initialState,
                    bio: profile?.bio || ''
                });

                // Filter cities based on initial country
                setFilteredCities((cData || []).filter(c => c && c.country === initialCountry));
                
                // Initialize answers state with ALL existing answers (questions + location)
                setAnswers(safeAnswers);
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
                // 1. Update Core Vendor Profile with essential fields only
                // (Location data and bio are saved as attributes below to avoid validation errors on older backend versions)
                await api.vendors.updateProfile({
                    businessName: basicInfo.businessName,
                    businessEmail: basicInfo.businessEmail,
                    businessPhone: basicInfo.businessPhone,
                    businessAddress: basicInfo.businessAddress,
                });

                // 2. Prepare location and bio attributes for search indexing compatibility
                const locationAttributes = {
                    'country': [basicInfo.country],
                    'city': [basicInfo.city],
                    'state': [basicInfo.state],
                    'bio': [basicInfo.bio]
                };

                // 3. Save to backend (dual storage for search)
                await api.businessSetup.saveAnswers({
                    ...answers,
                    ...locationAttributes
                });

                // 4. Update local state
                setAnswers(prev => ({
                    ...prev,
                    ...locationAttributes
                }));

                // Move to next step if dynamic questions exist, otherwise finish
                if (totalSteps > 1) {
                    setCurrentStep(1);
                    window.scrollTo(0, 0);
                } else {
                    await handleSubmit();
                }

            } catch (err: any) {
                // If the API endpoint doesn't exist on production yet (404), 
                // we allow the user to proceed with local state to see the wizard flow.
                if (err.message?.includes('404') || err.message?.includes('Cannot POST')) {
                    console.warn('Business setup API not found on production. Proceeding with local state.');
                    if (totalSteps > 1) {
                        setCurrentStep(1);
                        window.scrollTo(0, 0);
                    } else {
                        handleSubmit();
                    }
                    return;
                }
                console.error('Failed to update basic info:', err);
                alert('Error saving information. Please try again.');
            } finally {
                setSaving(false);
            }
        } else {
            // For categories steps
            if (currentStep < totalSteps - 1) {
                // Persistent save at each step
                setSaving(true);
                try {
                    await api.businessSetup.saveAnswers(answers);
                    setCurrentStep(currentStep + 1);
                    window.scrollTo(0, 0);
                } catch (err: any) {
                    if (err.message?.includes('404') || err.message?.includes('Cannot POST')) {
                        console.warn('Business setup API not found on production. Proceeding locally.');
                        setCurrentStep(currentStep + 1);
                        window.scrollTo(0, 0);
                        return;
                    }
                    console.error('Failed to save step progress:', err);
                } finally {
                    setSaving(false);
                }
            } else {
                // Final step
                handleSubmit();
            }
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
        } catch (err: any) {
            if (err.message?.includes('404') || err.message?.includes('Cannot POST')) {
                console.warn('Final save failed because the API is missing on production. Proceeding locally.');
                setCompleted(true);
                setTimeout(() => {
                    router.push('/vendor/dashboard');
                }, 2000);
                return;
            }
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
            // Fallback cities for Pakistan if none loaded from API
            const displayCities = (filteredCities.length > 0) 
                ? filteredCities 
                : (basicInfo.country === 'Pakistan' 
                    ? [
                        { id: 'isb', name: 'Islamabad' }, 
                        { id: 'lhr', name: 'Lahore' }, 
                        { id: 'khi', name: 'Karachi' },
                        { id: 'pwr', name: 'Peshawar' },
                        { id: 'fbd', name: 'Faisalabad' },
                        { id: 'mux', name: 'Multan' },
                        { id: 'skz', name: 'Sukkur' },
                        { id: 'pindi', name: 'Rawalpindi' },
                        { id: 'qta', name: 'Quetta' }
                    ] 
                    : []);

            return (
                <div className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
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
                                        {displayCities.map((city: any) => (
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

        const currentCategory = categories[currentStep - 1];
        const categoryQuestions = questions.filter(q => q.category === currentCategory);

        return (
            <div className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                        {getCategoryIcon(currentCategory)}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight">
                            {currentCategory}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">
                            Tell us more about your {currentCategory.toLowerCase()}
                        </p>
                    </div>
                </div>

                <div className="space-y-10 mb-10">
                    {categoryQuestions.map((q) => (
                        <div key={q.id} className="space-y-4">
                            <label className="block text-sm font-black text-slate-700 uppercase tracking-wide ml-1">
                                {q.question}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleOptionToggle(q.id, option)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-left ${
                                            (answers[q.id] || []).includes(option)
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]'
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'
                                        }`}
                                    >
                                        <span className="text-sm">{option}</span>
                                        {(answers[q.id] || []).includes(option) && (
                                            <div className="bg-blue-600 rounded-full p-1">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
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
                                    {currentStep === 0 ? 'Basic Information' : categories[currentStep - 1]}
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
                                className="flex items-center gap-2 px-6 py-4 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
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
                                        {currentStep === totalSteps - 1 ? 'Finish Setup' : 'Next Step'}
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
