from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

# Original key generation variables
"""
salt = b'&87\x92)\xb7\xfb\xd4\xe7\xe3\x87\x1b\xefL\x07g\xff/k\xac~w\xf1\x19U"\xf2\x0c_\xea\x03\x8c'
password = "discordstoragebot"
key = PBKDF2(password, salt, dkLen=32)
"""

def get_key():
    with open("key.bin", "rb") as f:
        return f.read()

def encrypt(msg):
    cipher = AES.new(get_key(), AES.MODE_CBC)
    ciphered_data = cipher.encrypt(pad(msg, AES.block_size))
    return cipher.iv + ciphered_data

def decrypt(file):
    iv = file.read(16)
    decrypt_data = file.read()
    cipher = AES.new(get_key(), AES.MODE_CBC, iv=iv)
    original = unpad(cipher.decrypt(decrypt_data), AES.block_size)
    return original