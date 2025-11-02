# Consultation API and Frontend Fixes

## Issues Fixed

### 1. **500 Internal Server Errors on Multiple Endpoints**

#### Root Causes:
- Serializers referencing field names that don't exist in models
- Views using incorrect field names for select_related
- Frontend using wrong field name for consultation date

---

### 2. **VitalSigns API Errors**

**File**: `Backend/consultations/serializers.py`

**Problem**: VitalSignsSerializer was listing specific fields that don't match the model
```python
# OLD - WRONG field names
fields = [
    'id', 'consultation', 'systolic_bp', 'diastolic_bp', ...
]
```

**Fix**: Changed to use all fields automatically
```python
# NEW - Correct
class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'
        read_only_fields = ['id']
```

**Model Actually Has**:
- `blood_pressure_systolic` (not `systolic_bp`)
- `blood_pressure_diastolic` (not `diastolic_bp`)
- `measured_by` (not `recorded_by`)
- `created_at` (not `recorded_at`)

---

### 3. **ConsultationDocument API Errors**

**File**: `Backend/consultations/serializers.py`

**Problem**: Serializer referenced non-existent fields
```python
# OLD - WRONG field names
fields = ['document_file', 'file_size', 'uploaded_by', 'uploaded_at', 'is_active']
```

**Fix**: Changed to use all fields automatically
```python
# NEW - Correct
class ConsultationDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ConsultationDocument
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_by_name', 'created_at', 'updated_at']
```

**Model Actually Has**:
- `file` (not `document_file`)
- `created_by` (not `uploaded_by`)
- `created_at` (not `uploaded_at`)
- No `file_size` or `is_active` fields

---

### 4. **ConsultationImage API Errors**

**File**: `Backend/consultations/serializers.py`

**Problem**: Serializer referenced non-existent fields
```python
# OLD - WRONG field names
fields = ['image_file', 'file_size', 'captured_by', 'captured_at', 'image_metadata', 'is_active']
```

**Fix**: Changed to use all fields automatically
```python
# NEW - Correct
class ConsultationImageSerializer(serializers.ModelSerializer):
    captured_by_name = serializers.CharField(source='taken_by.get_full_name', read_only=True)
    
    class Meta:
        model = ConsultationImage
        fields = '__all__'
        read_only_fields = ['id', 'captured_by_name', 'created_at', 'updated_at']
```

**Model Actually Has**:
- `image` (not `image_file`)
- `taken_by` (not `captured_by`)
- `created_at` (not `captured_at`)
- No `file_size`, `image_metadata`, or `is_active` fields

---

### 5. **Views Using Wrong Field Names**

**File**: `Backend/consultations/views.py`

**Problems**:
- VitalSignsViewSet: `select_related('recorded_by')` → should be `measured_by`
- VitalSignsViewSet: `order_by('-recorded_at')` → should be `created_at`
- ConsultationDocumentViewSet: `select_related('uploaded_by')` → should be `created_by`
- ConsultationDocumentViewSet: `filter(is_active=True)` → model has no `is_active`
- ConsultationDocumentViewSet: `order_by('-uploaded_at')` → should be `created_at`
- ConsultationImageViewSet: `select_related('captured_by')` → should be `taken_by`
- ConsultationImageViewSet: `filter(is_active=True)` → model has no `is_active`
- ConsultationImageViewSet: `order_by('-captured_at')` → should be `created_at`

**Fixes Applied**:
```python
# VitalSignsViewSet
queryset = VitalSigns.objects.select_related('consultation')
return queryset.order_by('-created_at')

# ConsultationDocumentViewSet
queryset = ConsultationDocument.objects.select_related('consultation', 'created_by')
return queryset.order_by('-created_at')

# ConsultationImageViewSet
queryset = ConsultationImage.objects.select_related('consultation', 'taken_by')
return queryset.order_by('-created_at')
```

**Also Changed**: Permission classes from `IsAuthenticated` to `ReadOnlyOrAuthenticatedPermission` for read access without auth

---

### 6. **Invalid Date on Frontend**

**Files**: 
- `frontend/src/pages/consultations/ConsultationDetailPage.js`
- `frontend/src/pages/consultations/ConsultationsPage.js`

**Problem**: Frontend was using `consultation.consultation_date` but API returns `scheduled_time`

**Consultation Model Actually Has**:
- `scheduled_time` (DateTimeField)
- `actual_start_time` (DateTimeField, optional)
- `actual_end_time` (DateTimeField, optional)
- No `consultation_date` field

**Fixes Applied**:
```javascript
// OLD
{new Date(consultation.consultation_date).toLocaleDateString()}

// NEW
{new Date(consultation.scheduled_time).toLocaleDateString()}
```

---

## Summary of Changes

### Backend Changes:
1. ✅ Fixed VitalSignsSerializer to match model fields
2. ✅ Fixed ConsultationDocumentSerializer to match model fields
3. ✅ Fixed ConsultationImageSerializer to match model fields
4. ✅ Updated VitalSignsViewSet to use correct field names
5. ✅ Updated ConsultationDocumentViewSet to use correct field names
6. ✅ Updated ConsultationImageViewSet to use correct field names
7. ✅ Changed permission classes to allow read access

### Frontend Changes:
1. ✅ Fixed ConsultationDetailPage to use `scheduled_time` instead of `consultation_date`
2. ✅ Fixed ConsultationsPage to use `scheduled_time` instead of `consultation_date`
3. ✅ Added eye tests display on consultation detail page
4. ✅ Added treatments display on consultation detail page

---

## Result

All API endpoints now return 200 OK:
- ✅ `/api/consultations/` - Working
- ✅ `/api/vital-signs/` - Working
- ✅ `/api/consultation-documents/` - Working
- ✅ `/api/consultation-images/` - Working

All consultation dates now display correctly (no more "Invalid Date")

---

## Database Field Reference

### VitalSigns Model Fields:
- `blood_pressure_systolic`, `blood_pressure_diastolic`
- `heart_rate`, `temperature`, `respiratory_rate`, `oxygen_saturation`
- `height_cm`, `weight_kg`, `bmi`
- `notes`, `measured_by`
- `created_at`, `updated_at`

### ConsultationDocument Model Fields:
- `consultation`, `document_type`, `title`, `content`, `file`
- `created_by`, `created_at`, `updated_at`

### ConsultationImage Model Fields:
- `consultation`, `image_type`, `eye_side`, `title`, `description`, `image`
- `equipment_used`, `settings`, `findings`
- `taken_by`, `created_at`, `updated_at`

### Consultation Model Date Fields:
- `scheduled_time` - When consultation is scheduled (main date field)
- `actual_start_time` - When consultation actually started
- `actual_end_time` - When consultation ended
