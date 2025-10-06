"""
Serializers for the accounts app - User and Staff management
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import CustomUser, StaffProfile


class CustomUserSerializer(serializers.ModelSerializer):
    """
    Serializer for CustomUser model
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'employee_id', 'phone_number', 'date_of_birth',
            'profile_picture', 'is_active', 'password', 'password_confirm',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password fields didn't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class StaffProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for StaffProfile model
    """
    user_details = CustomUserSerializer(source='user', read_only=True)
    
    class Meta:
        model = StaffProfile
        fields = [
            'id', 'user', 'user_details', 'department', 'specialization',
            'license_number', 'qualification', 'years_of_experience',
            'consultation_fee', 'availability_schedule', 'emergency_contact',
            'address', 'hire_date', 'is_consultant', 'can_prescribe',
            'can_perform_surgery', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StaffCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating staff members (combines user and profile)
    """
    # User fields
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    user_type = serializers.ChoiceField(choices=CustomUser.USER_TYPES)
    employee_id = serializers.CharField()
    phone_number = serializers.CharField(required=False)
    date_of_birth = serializers.DateField(required=False)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    # Profile fields
    department = serializers.ChoiceField(choices=StaffProfile.DEPARTMENTS)
    specialization = serializers.ChoiceField(choices=StaffProfile.SPECIALIZATIONS, required=False)
    license_number = serializers.CharField(required=False)
    qualification = serializers.CharField(required=False)
    years_of_experience = serializers.IntegerField(default=0)
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    availability_schedule = serializers.JSONField(default=dict)
    emergency_contact = serializers.CharField(required=False)
    address = serializers.CharField(required=False)
    hire_date = serializers.DateField(required=False)
    is_consultant = serializers.BooleanField(default=False)
    can_prescribe = serializers.BooleanField(default=False)
    can_perform_surgery = serializers.BooleanField(default=False)
    
    class Meta:
        model = StaffProfile
        fields = [
            # User fields
            'username', 'email', 'first_name', 'last_name', 'user_type',
            'employee_id', 'phone_number', 'date_of_birth', 'password', 'password_confirm',
            # Profile fields
            'department', 'specialization', 'license_number', 'qualification',
            'years_of_experience', 'consultation_fee', 'availability_schedule',
            'emergency_contact', 'address', 'hire_date', 'is_consultant',
            'can_prescribe', 'can_perform_surgery'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password fields didn't match.")
        return attrs
    
    def create(self, validated_data):
        # Extract user data
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'user_type': validated_data.pop('user_type'),
            'employee_id': validated_data.pop('employee_id'),
            'phone_number': validated_data.pop('phone_number', ''),
            'date_of_birth': validated_data.pop('date_of_birth', None),
        }
        
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        
        # Create user
        user = CustomUser.objects.create_user(**user_data)
        user.set_password(password)
        user.save()
        
        # Create staff profile
        staff_profile = StaffProfile.objects.create(user=user, **validated_data)
        
        return staff_profile


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid login credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs


class UserSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for UserSession model
    """
    user_details = CustomUserSerializer(source='user', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'user', 'user_details', 'session_key', 'ip_address', 
                 'user_agent', 'login_time', 'logout_time', 'is_active']
        read_only_fields = ['id', 'login_time']