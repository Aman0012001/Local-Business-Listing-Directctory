const fs = require('fs');
const file = 'components/vendor/AddBusinessModal.tsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

const keep = lines.slice(0, 468);

const newContent = `
                                    {activeTab === 'location' && (
                                        <motion.div key="location" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                                                    <div className="relative group">
                                                        <select required name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all appearance-none cursor-pointer pr-10 shadow-sm">
                                                            {cities.map(city => (<option key={city.id} value={city.name}>{city.name}</option>))}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State</label>
                                                    <input required name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                </div>
                                            </div>

                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Street Address / Area</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                    <select required name="address" value={formData.address} onChange={handleChange} className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm">
                                                        <option value="">Select Area</option>
                                                        <option value="DHA Phase 6">DHA Phase 6</option>
                                                        <option value="Gulberg III">Gulberg III</option>
                                                        <option value="Others">Others</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pincode</label>
                                                    <input required name="pincode" value={formData.pincode} onChange={handleChange} placeholder="50000" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lat</label>
                                                        <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-3 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Long</label>
                                                        <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-3 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-40 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 overflow-hidden relative group">
                                                <div className="absolute inset-0 bg-slate-200/50 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Navigation className="w-5 h-5 relative z-10" />
                                                <p className="text-[10px] font-black uppercase tracking-widest relative z-10">Map Picker Placeholder</p>
                                                <p className="text-[9px] font-medium relative z-10">(Google Maps implementation goes here)</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'media' && (
                                        <motion.div key="media" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center justify-between">Gallery Images<span className="text-[9px] text-slate-300 normal-case tracking-normal">Showcase your business</span></label>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {galleryPreviews.map((url, idx) => (
                                                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100">
                                                            <img src={getImageUrl(url) || ""} className={\`w-full h-full object-cover \${url.startsWith('blob:') ? 'opacity-50 grayscale' : ''}\`} />
                                                            <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"><X className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    ))}
                                                    <label className="aspect-square border-2 border-dashed bg-orange-50/30 border-orange-200 hover:bg-orange-50/50 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 group">
                                                        <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                                                        <div className="p-2 rounded-xl bg-white border border-slate-100 text-orange-500 shadow-sm group-hover:scale-110 transition-transform"><Plus className="w-4 h-4" /></div>
                                                        <span className="text-[9px] font-black uppercase text-slate-500">Add Photos</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Amenities</label>
                                                    <button type="button" onClick={() => setShowAddAmenity(!showAddAmenity)} className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg"><Plus className="w-3 h-3" /> Add New</button>
                                                </div>
                                                {showAddAmenity && (
                                                    <div className="flex gap-2">
                                                        <input type="text" placeholder="e.g. Free WiFi" value={newAmenityName} onChange={(e) => setNewAmenityName(e.target.value)} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())} />
                                                        <button type="button" onClick={handleAddAmenity} disabled={creatingAmenity || !newAmenityName.trim()} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">{creatingAmenity ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}</button>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                    {amenities.map((amenity) => {
                                                        const isSelected = formData.amenityIds.includes(amenity.id);
                                                        return (
                                                            <button key={amenity.id} type="button" onClick={() => toggleAmenity(amenity.id)} className={\`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group \${isSelected ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-600'}\`}>
                                                                <div className={\`w-5 h-5 rounded flex items-center justify-center transition-colors \${isSelected ? 'bg-orange-500 text-white' : 'bg-white border'}\`}>{isSelected && <Check className="w-3.5 h-3.5" />}</div>
                                                                <span className="text-xs font-bold truncate">{amenity.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center justify-between">
                                                    Search Keywords
                                                    <span className="text-[9px] text-slate-300 normal-case tracking-normal">max 20 tags</span>
                                                </label>
                                                <div
                                                    onClick={() => keywordInputRef.current?.focus()}
                                                    className="min-h-[52px] flex flex-wrap gap-2 cursor-text p-3 bg-slate-50 border border-slate-200 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-orange-400 focus-within:bg-white"
                                                >
                                                    {keywords.map(kw => (
                                                        <span
                                                            key={kw}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-700 border border-slate-200 shadow-sm rounded-lg text-xs font-bold transition-all hover:pr-1 group"
                                                        >
                                                            #{kw}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }}
                                                                className="w-0 overflow-hidden group-hover:w-4 transition-all flex items-center justify-center text-slate-400 hover:text-red-500"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <input
                                                        ref={keywordInputRef}
                                                        type="text"
                                                        value={keywordInput}
                                                        onChange={e => setKeywordInput(e.target.value)}
                                                        onKeyDown={handleKeywordKeyDown}
                                                        onBlur={() => { if (keywordInput.trim()) addKeyword(keywordInput); }}
                                                        placeholder={keywords.length === 0 ? 'Type a keyword, press Enter…' : ''}
                                                        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'social' && (
                                        <motion.div key="social" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number (*)</label>
                                                    <div className="relative group">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                        <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="+60..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp Number</label>
                                                    <div className="relative group">
                                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#25D366] transition-colors" />
                                                        <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+60..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white transition-all shadow-sm" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5 col-span-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Website</label>
                                                    <div className="relative group">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                        <input name="website" value={formData.website} onChange={handleChange} placeholder="https://..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Social Media Profiles</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {SOCIAL_PLATFORMS.map(p => {
                                                        const isSelected = !!socialLinks.find(s => s.platform === p.key);
                                                        return (
                                                            <button key={p.key} type="button" onClick={() => isSelected ? removeSocialLink(p.key) : addSocialLink(p.key)} className={\`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all \${isSelected ? 'text-white' : 'bg-slate-50 text-slate-500'}\`} style={isSelected ? { backgroundColor: p.color } : {}}>
                                                                <span className="text-[10px]">{isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}</span> {p.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    {socialLinks.map(link => {
                                                        const platform = SOCIAL_PLATFORMS.find(p => p.key === link.platform)!;
                                                        return (
                                                            <div key={link.platform} className="flex items-center gap-2 group/link">
                                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: platform.color }}>{platform.emoji}</div>
                                                                <input type="url" value={link.url} onChange={e => updateSocialUrl(link.platform, e.target.value)} placeholder={platform.placeholder} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                                                                <button type="button" onClick={() => removeSocialLink(link.platform)} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 flex items-center justify-center"><X className="w-4 h-4" /></button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md">
                                <button disabled={loading || galleryUploading} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-orange-500 flex items-center justify-center gap-2">
                                    {loading || galleryUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Store className="w-4 h-4" />{business ? 'Save Changes' : 'Publish Listing'}</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
`;

fs.writeFileSync(file, keep.join('\n') + newContent);
