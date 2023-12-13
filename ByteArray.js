
var ByteArray = cc.Class({

    properties: {
        _writeBytes:null,
        _readBytes:null,
        _writeDataView:null,
        _readDataView:null,
        _readPos:0,
        _writePos:0,
    },
    ctor:function()
    {
        this._writeBytes = new ArrayBuffer(102400)
        this._writeDataView = new DataView(this._writeBytes);
    },

    //清空数据
    ClearData:function()
    {
        this._readPos = 0;
        this._writePos = 0;
    },

    ResetReadBytes:function(bytes)
    {
        this._readBytes = bytes.buffer.slice(0,bytes.buffer.byteLength);
        this._readDataView = new DataView(this._readBytes);
    },

    ResetReadBytesEx:function(bytes)
    {
        //this._readBytes = bytes.slice(0,bytes.byteLength);
        this._readDataView = new DataView(bytes);
    },

    GetWritePos:function()
    {
        return this._writePos;
    },

    GetBytes:function()
    {
        return this._writeBytes;
    },

    WriteMsgLenth:function()
    {
        var nLenth = this._writePos - 4;
        this._writeDataView.setInt32(0,nLenth,true);
    },

    WriteString:function(strValue)
    {
        var bytes = this.StringToByte(strValue);
        this.WriteBytes(bytes);
    },

    StringToByte:function(strValue)
    {
        var bytes = new Array();  
        var len, c;  
        len = strValue.length;  
        for(var i = 0; i < len; i++) {  
            c = strValue.charCodeAt(i);  
            if(c >= 0x010000 && c <= 0x10FFFF) {  
                bytes.push(((c >> 18) & 0x07) | 0xF0);  
                bytes.push(((c >> 12) & 0x3F) | 0x80);  
                bytes.push(((c >> 6) & 0x3F) | 0x80);  
                bytes.push((c & 0x3F) | 0x80);  
            } else if(c >= 0x000800 && c <= 0x00FFFF) {  
                bytes.push(((c >> 12) & 0x0F) | 0xE0);  
                bytes.push(((c >> 6) & 0x3F) | 0x80);  
                bytes.push((c & 0x3F) | 0x80);  
            } else if(c >= 0x000080 && c <= 0x0007FF) {  
                bytes.push(((c >> 6) & 0x1F) | 0xC0);  
                bytes.push((c & 0x3F) | 0x80);  
            } else {  
                bytes.push(c & 0xFF);  
            }  
        }  
        return bytes;  
    },

    WriteInt32:function(nValue)
    {
        this._writeDataView.setInt32(this._writePos,nValue,true);
        this._writePos = this._writePos + 4;//暂时写死
    },

    WriteInt64:function(nValue)
    {
        this._writeDataView.setInt32(this._writePos,nValue,true);//这之后要修改一下 暂时这么写
        this._writePos = this._writePos + 4;
        this._writeDataView.setInt32(this._writePos,0,true);
        this._writePos = this._writePos + 4;
    },

    WriteBytes:function(bytes)
    {
        var byteLength = bytes.length;
        this.WriteInt32(byteLength);
        for(var n = 0 ; n < byteLength; n++)
        {
            this._writeDataView.setUint16(this._writePos,bytes[n],true);
            this._writePos = this._writePos + 1;
        }
    },

    WriteBoolean:function(bValue)
    {
        this.WriteInt8(bValue?1:0);
    },

    WriteInt8:function(byte)
    {
        this._writeDataView.setInt8(this._writePos,byte,true);
        this._writePos = this._writePos + 1;
    },
    WriteDouble:function(dValue)
    {
        this._writeDataView.setFloat64(this._writePos,dValue,true);
        this._writePos = this._writePos + 8;
    },
    WriteSingle:function(fValue)
    {
        this._writeDataView.setFloat32(this._writePos,fValue,true);
        this._writePos = this._writePos + 4;
    },
    WriteInt16:function(nValue)
    {
        this._writeDataView.setInt16(this._writePos,nValue,true);
        this._writePos = this._writePos + 2;
    },

    ReadInt32:function()
    {
        var value = this._readDataView.getInt32(this._readPos,true);
        this._readPos = this._readPos + 4;
        return value;
    },
    ReadInt64:function()
    {
        var value = this._readDataView.getInt32(this._readPos,true);
        this._readPos = this._readPos + 4;
        this._readDataView.getInt32(this._readPos,true);
        this._readPos = this._readPos + 4;
        return value;
    },

    ReadBoolean:function()
    {
        var value = this.ReadInt8();
        return (value== 0 ? false:true);
    },
    ReadInt8:function()
    {
        var value = this._readDataView.getInt8(this._readPos,true);
        this._readPos = this._readPos + 1;
        return value;
    },
    ReadDouble:function()
    {
        var value = this._readDataView.getFloat64(this._readPos,true);
        this._readPos = this._readPos + 8;
        return value;
    },
    ReadSingle:function()
    {
        var value = this._readDataView.getFloat32(this._readPos,true);
        this._readPos = this._readPos + 4;
        return value;
    },
    ReadBytes:function()
    {
        var nLenth = this.ReadInt32();
        var arrBuf = this._readDataView.buffer.slice(this._readPos,this._readPos + nLenth);
        this._readPos = this._readPos + nLenth;
        var uArr = new Uint8Array(arrBuf);
        var normalArray = [].slice.call(uArr);
        return normalArray;
    },

    ReadBytesEx:function(bytes,nOffSet,nLength)
    {
        var arrBuf = this._readDataView.buffer.slice(this._readPos,this._readPos + nLength);
        this._readPos = this._readPos + nLength;
        var uArr = new Uint8Array(arrBuf);
        var normalArray = [].slice.call(uArr);
        bytes = normalArray;
    },
    ReadString:function()
    {
        var arr = this.ReadBytes();
        return this.ByteToString(arr);
    },
    ByteToString:function(arr)
    {
        if(typeof arr === 'string') {  
            return arr;  
        }  
        var str = '',  
            _arr = arr; 
        for(var i = 0; i < _arr.length; i++) {  
            var one = _arr[i].toString(2),  
                v = one.match(/^1+?(?=0)/);  
            if(v && one.length == 8) {  
                var bytesLength = v[0].length;  
                var store = _arr[i].toString(2).slice(7 - bytesLength);  
                for(var st = 1; st < bytesLength; st++) {  
                    store += _arr[st + i].toString(2).slice(2);  
                }  
                str += String.fromCharCode(parseInt(store, 2));  
                i += bytesLength - 1;  
            } else {  
                str += String.fromCharCode(_arr[i]);  
            }  
        }  
        return str; 
    }
    

});
module.exports = ByteArray;