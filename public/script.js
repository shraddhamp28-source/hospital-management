let allDoctors = [];
let currentFilteredDoctors = [];
let selectedAlphabet = null;
let selectedDoctorForBooking = null;
let currentStep = 1;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    generateAlphabetFilter();
    fetchDoctors();
    setupEventListeners();
    
    // Set today's date as min for appointment date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
});

// Fetch Doctors from API
async function fetchDoctors() {
    try {
        const response = await fetch('/api/doctors');
        allDoctors = await response.json();
        currentFilteredDoctors = [...allDoctors];
        renderDoctors(currentFilteredDoctors);
    } catch (err) {
        console.error('Error fetching doctors:', err);
        document.getElementById('resultCount').textContent = 'Error loading doctors. Please try again.';
    }
}

// Setup Listeners
function setupEventListeners() {
    document.getElementById('speciality').addEventListener('change', filterDoctors);
    document.getElementById('doctorName').addEventListener('input', filterDoctors);
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    document.getElementById('appointmentDate').addEventListener('change', (e) => {
        if(e.target.value) {
            document.getElementById('noDateSelectedMsg').classList.add('hidden');
            generateTimeSlots();
        } else {
            document.getElementById('noDateSelectedMsg').classList.remove('hidden');
            document.getElementById('timeSlots').innerHTML = '';
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Generate A-Z Buttons
function generateAlphabetFilter() {
    const container = document.getElementById('alphabetFilter');
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    // Add 'All' button
    const allBtn = document.createElement('button');
    allBtn.textContent = 'All';
    allBtn.className = 'px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none text-gray-700 transition ring-2 ring-primary bg-gray-100 shrink-0';
    allBtn.onclick = () => filterByAlphabet(null, allBtn);
    container.appendChild(allBtn);

    alphabets.forEach(letter => {
        const btn = document.createElement('button');
        btn.textContent = letter;
        btn.className = 'px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none text-gray-700 transition shrink-0';
        btn.onclick = () => filterByAlphabet(letter, btn);
        container.appendChild(btn);
    });
}

function filterByAlphabet(letter, btnElement) {
    selectedAlphabet = letter;
    const buttons = document.getElementById('alphabetFilter').querySelectorAll('button');
    buttons.forEach(btn => btn.classList.remove('bg-gray-100', 'ring-2', 'ring-primary'));
    btnElement.classList.add('bg-gray-100', 'ring-2', 'ring-primary');
    filterDoctors();
}

function filterDoctors() {
    const specValue = document.getElementById('speciality').value;
    const nameSearch = document.getElementById('doctorName').value.toLowerCase();
    
    currentFilteredDoctors = allDoctors.filter(doc => {
        const matchSpec = specValue === 'all' || doc.speciality === specValue;
        const matchName = doc.name.toLowerCase().includes(nameSearch) || 
                          doc.speciality.toLowerCase().includes(nameSearch) ||
                          doc.qualification.toLowerCase().includes(nameSearch);
        let matchAlpha = true;
        if (selectedAlphabet) {
            const nameWithoutTitle = doc.name.replace(/^Dr\.\s*/i, '');
            matchAlpha = nameWithoutTitle.charAt(0).toUpperCase() === selectedAlphabet;
        }
        return matchSpec && matchName && matchAlpha;
    });
    renderDoctors(currentFilteredDoctors);
}

function renderDoctors(doctors) {
    const list = document.getElementById('doctorsList');
    const noResults = document.getElementById('noResults');
    const resultCount = document.getElementById('resultCount');
    
    list.innerHTML = '';
    resultCount.textContent = `Showing ${doctors.length} available doctor${doctors.length !== 1 ? 's' : ''}`;
    
    if (doctors.length === 0) {
        list.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    list.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    doctors.forEach(doc => {
        const initials = doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2);
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full';
        card.innerHTML = `
            <div class="p-6 grow flex flex-col">
                <div class="flex items-start mb-4">
                    <div class="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center text-xl font-bold shrink-0">${initials}</div>
                    <div class="ml-4">
                        <h4 class="text-lg font-bold text-gray-900 leading-tight">${doc.name}</h4>
                        <span class="inline-block bg-secondary text-primary text-xs px-2 py-1 rounded mt-1 font-medium">${doc.speciality}</span>
                    </div>
                </div>
                <div class="space-y-2 text-sm text-gray-600 mt-2 grow">
                    <p><i class="fas fa-graduation-cap mr-2 text-gray-400"></i>${doc.qualification}</p>
                    <p><i class="fas fa-briefcase mr-2 text-gray-400"></i>${doc.experience} Experience</p>
                    <p><i class="far fa-calendar-alt mr-2 text-gray-400"></i>Available: ${doc.availableDays}</p>
                    ${doc.specialityInfo ? `<p class="mt-3 text-xs italic text-gray-500 line-clamp-6 border-t pt-2">${doc.specialityInfo}</p>` : ''}
                </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button onclick="openBookingModal('${doc._id}')" class="w-full bg-white hover:bg-primary hover:text-white text-primary border border-primary font-medium py-2 px-4 rounded transition">
                    Book Appointment
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

function openBookingModal(doctorId) {
    selectedDoctorForBooking = allDoctors.find(d => d._id === doctorId);
    if(!selectedDoctorForBooking) return;

    document.getElementById('modalDoctorName').textContent = selectedDoctorForBooking.name;
    document.getElementById('modalDoctorSpec').textContent = selectedDoctorForBooking.speciality;
    const initials = selectedDoctorForBooking.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2);
    document.getElementById('modalDoctorInitial').textContent = initials;

    currentStep = 1;
    
    // Reset form fields
    document.getElementById('uhid_mobile').value = '';
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('mobile').value = '';
    document.getElementById('email').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('dob').value = '';
    
    document.getElementById('appointmentDate').value = '';
    document.getElementById('timeSlots').innerHTML = '';
    document.getElementById('noDateSelectedMsg').classList.remove('hidden');
    
    updateStepView();
    document.getElementById('bookingModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function togglePatientForm() {
    const type = document.querySelector('input[name="patientType"]:checked').value;
    document.getElementById('existingPatientForm').classList.toggle('hidden', type !== 'existing');
    document.getElementById('newPatientForm').classList.toggle('hidden', type !== 'new');
}

function updateStepView() {
    [1, 2, 3].forEach(step => document.getElementById(`step${step}`).classList.add('hidden'));
    document.getElementById(`step${currentStep}`).classList.remove('hidden');

    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');
    const btnConfirm = document.getElementById('btnConfirm');
    const btnCloseSuccess = document.getElementById('btnCloseSuccess');
    
    btnBack.classList.toggle('hidden', currentStep !== 2);
    btnNext.classList.toggle('hidden', currentStep !== 1);
    btnConfirm.classList.toggle('hidden', currentStep !== 2);
    btnCloseSuccess.classList.toggle('hidden', currentStep !== 3);
}

function nextStep() {
    if (currentStep === 1) {
        const patientType = document.querySelector('input[name="patientType"]:checked').value;
        if (patientType === 'existing') {
            if (!document.getElementById('uhid_mobile').value.trim()) {
                return alert('Please enter your UHID or Mobile Number.');
            }
        } else {
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const mobile = document.getElementById('mobile').value.trim();
            const gender = document.getElementById('gender').value;
            if (!firstName || !lastName || !mobile || !gender) {
                return alert('Please fill in all required fields (First Name, Last Name, Mobile Number, Gender).');
            }
        }

        currentStep = 2;
        updateStepView();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepView();
    }
}

async function generateTimeSlots() {
    const container = document.getElementById('timeSlots');
    const date = document.getElementById('appointmentDate').value;
    const doctorId = selectedDoctorForBooking._id;

    if (!date) return;

    container.innerHTML = '<div class="col-span-full text-center py-4"><i class="fas fa-spinner fa-spin text-primary mr-2"></i>Loading slots...</div>';

    try {
        const response = await fetch(`/api/booked-slots?doctorId=${doctorId}&date=${date}`);
        const bookedSlots = await response.json();

        container.innerHTML = '';
        const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '12:30 PM', '02:00 PM', '03:30 PM', '04:00 PM', '05:00 PM'];
        
        slots.forEach(time => {
            const isBooked = bookedSlots.includes(time);
            const html = `
                <label class="time-slot block ${isBooked ? 'opacity-40 cursor-not-allowed' : ''}">
                    <input type="radio" name="timeSlot" value="${time}" class="peer sr-only" ${isBooked ? 'disabled' : ''}>
                    <div class="px-2 py-2 text-center text-sm rounded-md border border-gray-300 text-gray-700 
                        ${isBooked ? 'bg-gray-100' : 'peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary hover:border-primary cursor-pointer'}">
                        ${time}
                    </div>
                </label>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        if (slots.every(slot => bookedSlots.includes(slot))) {
            container.innerHTML = '<p class="col-span-full text-center text-red-500 py-4 font-medium">No available slots for this date. Please select another date.</p>';
        }

    } catch (err) {
        console.error('Error fetching slots:', err);
        container.innerHTML = '<p class="col-span-full text-center text-red-500 py-4">Failed to load time slots.</p>';
    }
}

async function confirmBooking() {
    const date = document.getElementById('appointmentDate').value;
    const timeSlot = document.querySelector('input[name="timeSlot"]:checked');
    if(!date || !timeSlot) return alert("Please select both date and time.");

    const btnConfirm = document.getElementById('btnConfirm');
    const originalBtnText = btnConfirm.innerHTML;
    btnConfirm.disabled = true;
    btnConfirm.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Booking...';

    const patientType = document.querySelector('input[name="patientType"]:checked').value;
    const bookingData = {
        patientType,
        doctorId: selectedDoctorForBooking._id,
        date,
        time: timeSlot.value
    };

    if (patientType === 'existing') {
        bookingData.uhid = document.getElementById('uhid_mobile').value;
        bookingData.mobileNumber = bookingData.uhid; // Simplified for prototype
    } else {
        bookingData.patientName = document.getElementById('firstName').value;
        bookingData.patientLastName = document.getElementById('lastName').value;
        bookingData.mobileNumber = document.getElementById('mobile').value;
        bookingData.email = document.getElementById('email').value;
        bookingData.gender = document.getElementById('gender').value;
        bookingData.dob = document.getElementById('dob').value;
    }

    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('successDoctorName').textContent = selectedDoctorForBooking.name;
            document.getElementById('successRefId').textContent = result.referenceId;
            document.getElementById('successDate').textContent = new Date(result.date).toLocaleDateString();
            document.getElementById('successTime').textContent = result.time;
            currentStep = 3;
            updateStepView();
        } else {
            alert("Booking failed: " + result.message);
        }
    } catch (err) {
        console.error('Booking error:', err);
        alert("An error occurred during booking.");
    } finally {
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = originalBtnText;
    }
}

function resetFilters() {
    document.getElementById('speciality').value = 'all';
    document.getElementById('doctorName').value = '';
    const allBtn = document.getElementById('alphabetFilter').querySelector('button');
    if(allBtn) filterByAlphabet(null, allBtn);
}

async function trackAppointment() {
    const refId = document.getElementById('trackRefId').value.trim();
    if (!refId) return;

    const btnTrack = document.getElementById('btnTrack');
    const resultDiv = document.getElementById('trackResult');
    const contentDiv = document.getElementById('trackContent');
    const errorDiv = document.getElementById('trackError');
    const errorMessage = document.getElementById('trackErrorMessage');

    // Reset state
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    btnTrack.disabled = true;
    btnTrack.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Tracking...';

    try {
        const response = await fetch(`/api/appointments/${refId}`);
        const data = await response.json();

        if (response.ok) {
            const dateStr = new Date(data.date).toLocaleDateString('en-IN', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            
            contentDiv.innerHTML = `
                <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <span class="text-xs font-bold text-primary uppercase tracking-wider">Reference ID</span>
                            <h3 class="text-2xl font-mono font-bold text-gray-900">${data.referenceId}</h3>
                        </div>
                        <div class="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-bold flex items-center">
                            <i class="fas fa-check-circle mr-2"></i> Confirmed
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 class="text-sm font-semibold text-gray-500 mb-3 uppercase">Doctor Details</h4>
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-3">
                                    ${data.doctorId.name.replace('Dr. ', '').charAt(0)}
                                </div>
                                <div>
                                    <p class="font-bold text-gray-900">${data.doctorId.name}</p>
                                    <p class="text-sm text-gray-600">${data.doctorId.speciality}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-gray-500 mb-3 uppercase">Schedule</h4>
                            <div class="space-y-2">
                                <p class="flex items-center text-gray-700">
                                    <i class="far fa-calendar-alt w-6 text-primary"></i> 
                                    <span class="font-medium">${dateStr}</span>
                                </p>
                                <p class="flex items-center text-gray-700">
                                    <i class="far fa-clock w-6 text-primary"></i> 
                                    <span class="font-medium">${data.time}</span>
                                </p>
                            </div>
                        </div>
                        <div class="md:col-span-2 pt-4 border-t border-blue-100 mt-2 flex flex-col md:flex-row justify-between items-end gap-4">
                            <div>
                                <h4 class="text-sm font-semibold text-gray-500 mb-3 uppercase">Patient Information</h4>
                                <p class="text-gray-900 font-medium">
                                    ${data.patientName ? `${data.patientName} ${data.patientLastName}` : `UHID: ${data.uhid}`}
                                </p>
                                <p class="text-sm text-gray-600">${data.mobileNumber}</p>
                            </div>
                            <button onclick="cancelAppointment('${data.referenceId}')" class="text-red-600 hover:text-red-800 text-sm font-bold border border-red-200 hover:bg-red-50 px-4 py-2 rounded-md transition">
                                <i class="fas fa-times-circle mr-2"></i> Cancel Appointment
                            </button>
                        </div>
                    </div>
                </div>
            `;
            resultDiv.classList.remove('hidden');
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            errorMessage.textContent = data.message;
            errorDiv.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Tracking error:', err);
        errorMessage.textContent = "An error occurred while fetching appointment details.";
        errorDiv.classList.remove('hidden');
    } finally {
        btnTrack.disabled = false;
        btnTrack.innerHTML = 'Track Status';
    }
}

async function cancelAppointment(refId) {
    if (!confirm(`Are you sure you want to cancel appointment ${refId}? This action cannot be undone.`)) return;

    try {
        const response = await fetch(`/api/appointments/${refId}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            document.getElementById('trackResult').classList.add('hidden');
            document.getElementById('trackRefId').value = '';
            // If admin is logged in, refresh their view too
            if (!document.getElementById('adminDashboard').classList.contains('hidden')) {
                fetchAdminAppointments();
            }
        } else {
            alert("Cancellation failed: " + result.message);
        }
    } catch (err) {
        console.error('Cancellation error:', err);
        alert("An error occurred during cancellation.");
    }
}

// Admin Logic
let currentAdminAppointments = [];

function adminLogin() {
    const passcode = document.getElementById('adminPasscode').value;
    if (passcode === 'admin123') {
        document.getElementById('adminLogin').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        switchAdminTab('appointments');
    } else {
        alert("Invalid passcode. Please try again.");
    }
}

function adminLogout() {
    document.getElementById('adminPasscode').value = '';
    document.getElementById('adminLogin').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

function switchAdminTab(tab) {
    const appSection = document.getElementById('appointmentsSection');
    const docSection = document.getElementById('doctorsSection');
    const appTab = document.getElementById('tabAppointments');
    const docTab = document.getElementById('tabDoctors');

    if (tab === 'appointments') {
        appSection.classList.remove('hidden');
        docSection.classList.add('hidden');
        appTab.className = 'px-4 py-2 bg-primary text-white rounded-md font-medium transition flex items-center shadow-md';
        docTab.className = 'px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition flex items-center border border-gray-200';
        fetchAdminAppointments();
    } else {
        appSection.classList.add('hidden');
        docSection.classList.remove('hidden');
        docTab.className = 'px-4 py-2 bg-primary text-white rounded-md font-medium transition flex items-center shadow-md';
        appTab.className = 'px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition flex items-center border border-gray-200';
        renderAdminDoctors(allDoctors);
    }
}

function renderAdminDoctors(doctors) {
    const tableBody = document.getElementById('adminDoctorsTableBody');
    tableBody.innerHTML = '';

    doctors.forEach(doc => {
        const row = `
            <tr class="hover:bg-gray-50 transition text-sm">
                <td class="px-6 py-4 font-bold text-gray-900">${doc.name}</td>
                <td class="px-6 py-4 text-gray-600">${doc.speciality}</td>
                <td class="px-6 py-4 text-gray-600">${doc.qualification}</td>
                <td class="px-6 py-4 text-gray-600">${doc.availableDays}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-3">
                        <button onclick="openEditDoctorModal('${doc._id}')" class="text-primary hover:text-blue-800 font-medium flex items-center">
                            <i class="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button onclick="deleteDoctor('${doc._id}')" class="text-red-500 hover:text-red-700 font-medium flex items-center">
                            <i class="fas fa-trash-alt mr-1"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function filterAdminDoctors() {
    const search = document.getElementById('adminDoctorSearch').value.toLowerCase();
    const filtered = allDoctors.filter(doc => 
        doc.name.toLowerCase().includes(search) || 
        doc.speciality.toLowerCase().includes(search)
    );
    renderAdminDoctors(filtered);
}

function openAddDoctorModal() {
    document.getElementById('editDocId').value = '';
    document.getElementById('editDoctorForm').reset();
    document.querySelector('#editDoctorModal h3').textContent = 'Add New Doctor';
    document.querySelector('#editDoctorForm button[type="submit"]').textContent = 'Add Doctor';
    document.getElementById('editDoctorModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function openEditDoctorModal(doctorId) {
    const doc = allDoctors.find(d => d._id === doctorId);
    if (!doc) return;

    document.getElementById('editDocId').value = doc._id;
    document.getElementById('editDocName').value = doc.name;
    document.getElementById('editDocSpec').value = doc.speciality;
    document.getElementById('editDocQual').value = doc.qualification;
    document.getElementById('editDocExp').value = doc.experience;
    document.getElementById('editDocAvail').value = doc.availableDays;
    document.getElementById('editDocSpecInfo').value = doc.specialityInfo || '';

    document.querySelector('#editDoctorModal h3').textContent = 'Edit Doctor Information';
    document.querySelector('#editDoctorForm button[type="submit"]').textContent = 'Save Changes';

    document.getElementById('editDoctorModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEditDoctorModal() {
    document.getElementById('editDoctorModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

async function deleteDoctor(doctorId) {
    if (!confirm('Are you sure you want to remove this doctor? This will not affect existing appointments but the doctor will no longer be available for new bookings.')) return;

    try {
        const response = await fetch(`/api/doctors/${doctorId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Doctor removed successfully.');
            await fetchDoctors();
            renderAdminDoctors(allDoctors);
        } else {
            const error = await response.json();
            alert('Failed to delete: ' + error.message);
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('An error occurred while removing the doctor.');
    }
}

async function saveDoctorInfo() {
    const id = document.getElementById('editDocId').value;
    const doctorData = {
        name: document.getElementById('editDocName').value,
        speciality: document.getElementById('editDocSpec').value,
        qualification: document.getElementById('editDocQual').value,
        experience: document.getElementById('editDocExp').value,
        availableDays: document.getElementById('editDocAvail').value,
        specialityInfo: document.getElementById('editDocSpecInfo').value
    };

    const url = id ? `/api/doctors/${id}` : '/api/doctors';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorData)
        });

        if (response.ok) {
            alert(id ? 'Doctor information updated successfully!' : 'New doctor added successfully!');
            closeEditDoctorModal();
            await fetchDoctors(); // Refresh local list
            renderAdminDoctors(allDoctors); // Refresh table
        } else {
            const error = await response.json();
            alert('Failed to save: ' + error.message);
        }
    } catch (err) {
        console.error('Save error:', err);
        alert('An error occurred while saving.');
    }
}

async function fetchAdminAppointments() {
    const tableBody = document.getElementById('adminTableBody');
    const loading = document.getElementById('adminLoading');
    const empty = document.getElementById('adminEmpty');
    
    // Stats elements
    const statTotal = document.getElementById('statTotal');
    const statNew = document.getElementById('statNew');
    const statExisting = document.getElementById('statExisting');
    const statToday = document.getElementById('statToday');

    tableBody.innerHTML = '';
    loading.classList.remove('hidden');
    empty.classList.add('hidden');

    try {
        const response = await fetch('/api/admin/appointments');
        currentAdminAppointments = await response.json();
        
        loading.classList.add('hidden');

        // Calculate Stats
        const total = currentAdminAppointments.length;
        const newPatients = currentAdminAppointments.filter(a => a.patientType === 'new').length;
        const existingPatients = total - newPatients;
        
        const todayStr = new Date().toISOString().split('T')[0];
        const appointmentsToday = currentAdminAppointments.filter(a => {
            const appDate = new Date(a.date).toISOString().split('T')[0];
            return appDate === todayStr;
        }).length;

        // Update Stats UI
        statTotal.textContent = total;
        statNew.textContent = newPatients;
        statExisting.textContent = existingPatients;
        statToday.textContent = appointmentsToday;

        if (total === 0) {
            empty.classList.remove('hidden');
            return;
        }

        currentAdminAppointments.forEach(app => {
            const dateStr = new Date(app.date).toLocaleDateString();
            const patientName = app.patientName ? `${app.patientName} ${app.patientLastName}` : `UHID: ${app.uhid}`;
            
            const row = `
                <tr class="hover:bg-gray-50 transition text-sm">
                    <td class="px-6 py-4 font-mono font-bold text-gray-900">${app.referenceId}</td>
                    <td class="px-6 py-4">
                        <div class="font-medium text-gray-900">${patientName}</div>
                        <div class="text-xs text-gray-500">${app.mobileNumber}</div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">${app.doctorId.name}</td>
                    <td class="px-6 py-4">
                        <div class="text-gray-900">${dateStr}</div>
                        <div class="text-xs text-gray-500">${app.time}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs font-bold rounded-full ${app.patientType === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
                            ${app.patientType.toUpperCase()}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <button onclick="cancelAppointment('${app.referenceId}')" class="text-red-500 hover:text-red-700 transition">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (err) {
        console.error('Admin fetch error:', err);
        loading.classList.add('hidden');
        alert("Failed to load appointments for dashboard.");
    }
}

function exportToCSV() {
    if (currentAdminAppointments.length === 0) {
        return alert("No data available to export.");
    }

    const headers = ['Reference ID', 'Patient Name', 'Mobile', 'Doctor', 'Speciality', 'Date', 'Time', 'Type'];
    const rows = currentAdminAppointments.map(app => [
        app.referenceId,
        app.patientName ? `${app.patientName} ${app.patientLastName}` : `UHID: ${app.uhid}`,
        app.mobileNumber,
        app.doctorId.name,
        app.doctorId.speciality,
        new Date(app.date).toLocaleDateString(),
        app.time,
        app.patientType
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `terna_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
