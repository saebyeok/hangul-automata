/**
 * HANGUL Automata for JAVASCRIPT
 * Created by Saebyeok on 2014-03-28.
 */

'use strict';
(function(){
    var ham = {
        ingWord : "", completeText : "", completeWord : "", isShift : false, isKorean : true, mode : "ko", //ko, en, num, sym(bol), op(operator)
        isCtrl : false, isAlt : false,
        H_STATUS : {
            H_FIRST : 0,          // 초성
            H_FIRST_V : 1,        // 자음 + 자음
            H_FIRST_C : 2,        // 모음 + 모음
            H_MIDDLE : 3,         // 초성 + 모음 + 모음
            H_END : 4,            // 초성 + 중성 + 종성
            H_END_STATE : 5,      // 초성 + 중성 + 자음 + 자음
            H_END_EXCEPTION : 6   // 초성 + 중성 + 종성(곁자음)
        },
        nowStatus : 0,
        SOUND_TABLE :[
            /* 초성 19자 0 ~ 18 */
            'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ',
            'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
            'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ',
            'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
            /* 중성 21자 19 ~ 39 */
            'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ',
            'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
            'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ',
            'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ',
            'ㅣ',
            /* 종성 28자 40 ~ 67 */
            ' ', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ',
            'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', //49
            'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', //54
            'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', //59
            'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', //64
            'ㅌ', 'ㅍ', 'ㅎ'
        ],
        keyTable : [
            //ㅁ  ㅠ  ㅊ  ㅇ  ㄷ
            6, 36, 14, 11,  3, // a ~ e
            //ㄹ  ㅎ  ㅗ  ㅑ  ㅓ
            5, 18, 27, 21, 23, // f ~ j
            //ㅏ  ㅣ  ㅡ  ㅜ  ㅐ
            19, 39, 37, 32, 20, // k ~ o
            //ㅔ  ㅂ  ㄱ  ㄴ  ㅅ
            24,  7,  0,  2,  9, // p ~ t
            //ㅕ  ㅠ  ㅈ  ㅌ  ㅛ  ㅋ
            25, 17, 12, 16, 31, 15//u ~ z
        ],
        keyTableShift : [
            //ㅁ  ㅠ  ㅊ  ㅇ  ㄸ
            6, 36, 14, 11,  4, // a ~ e
            //ㄹ  ㅎ  ㅗ  ㅑ  ㅓ
            5, 18, 27, 21, 23, // f ~ j
            //ㅏ  ㅣ  ㅡ  ㅜ  ㅒ
            19, 39, 37, 32, 22, // k ~ o
            //ㅖ  ㅃ  ㄲ  ㄴ  ㅅ
            26,  8,  1,  2,  10, // p ~ t
            //ㅕ  ㅠ  ㅈ  ㅌ  ㅛ  ㅋ
            25, 17, 13, 16, 31, 15//u ~ z
        ],
        // 이중모음 - 모음 합성
        MIXED_VOWEL : [
            [27,19,28], // ㅗ,ㅏ,ㅘ
            [27,20,29], // ㅗ,ㅐ,ㅙ
            [27,39,30], // ㅗ,ㅣ,ㅚ
            [32,23,33], // ㅜ,ㅓ,ㅝ
            [32,24,34], // ㅜ,ㅔ,ㅞ
            [32,39,35], // ㅜ,ㅣ,ㅟ
            [37,39,38] // ㅡ,ㅣ,ㅢ
        ],
        MIXED_JONG_CONSON :[
            [41,59,43], // ㄱ,ㅅ,ㄳ
            [44,62,45], // ㄴ,ㅈ,ㄵ
            [44,67,46], // ㄴ,ㅎ,ㄶ
            [48,41,49], // ㄹ,ㄱ,ㄺ
            [48,56,50], // ㄹ,ㅁ,ㄻ
            [48,57,51], // ㄹ,ㅂ,ㄼ
            [48,66,54], // ㄹ,ㅍ,ㄿ
            [48,59,52], // ㄹ,ㅅ,ㄽ
            [48,65,53], // ㄹ,ㅌ,ㄾ
            [48,67,55], // ㄹ,ㅎ,ㅀ
            [57,59,58]  // ㅂ,ㅅ,ㅄ

        ],
        DIVIDE_JONG_CONSON : [
            [41,41,42], // ㄱ,ㄱ,ㄲ
            [41,59,43], // ㄱ,ㅅ,ㄳ
            [44,62,45], // ㄴ,ㅈ,ㄵ
            [44,67,46], // ㄴ,ㅎ,ㄶ
            [48,41,49], // ㄹ,ㄱ,ㄺ
            [48,56,50], // ㄹ,ㅁ,ㄻ
            [48,57,51], // ㄹ,ㅂ,ㄼ
            [48,66,54], // ㄹ,ㅍ,ㄿ
            [48,59,52], // ㄹ,ㅅ,ㄽ
            [48,65,53], // ㄹ,ㅌ,ㄾ
            [48,67,55], // ㄹ,ㅎ,ㅀ
            [57,59,58], // ㅂ,ㅅ,ㅄ
            [59,59,60]  // ㅅ,ㅅ,ㅆ
        ],
        specialChar : {
            187 : ['=', '+'],
            188 : [',', '<'],
            189 : ['-', '_'],
            190 : ['.', '>'],
            191: ['/', '?'],
            186 : [';', ':'],
            222 : ['\'', '\"'],
            219 : ['[', '{'],
            221 : [']', '}'],
            220 : ['\\', '|'],
            192 : ['`', '~'],
            106 : ["*", "*"],
            107 : ["+", "+"],
            109 : ["-", "-"],
            110 : [".", "."],
            111 : ["/", "/"]
        },
        phonemes : [-1, -1, -1, -1, -1],
        clear : function(){
            this.nowStatus = this.H_STATUS.H_FIRST;
            this.completeText = "";
            this.ingWord = "";
            this.completeWord = "";
        },
        click : function(){
            this.completeText += this.ingWord;
            return this.completeWord;
        },
        mixInitial : function ( inputCode ){
            if( inputCode > 18 ){
                return false;
            }
            //for(var i=0; i < mix)
            return false;
        },
        mixVowel : function( num, inputCode ){ //중성 모음 합성
            for(var i = 0; i < this.MIXED_VOWEL.length; i++){
                //if (MIXED_VOWEL[i,0] == currentCode && MIXED_VOWEL[i,1] == inputCode)
                if(this.MIXED_VOWEL[i][0] == this.phonemes[num] && this.MIXED_VOWEL[i][1] == inputCode)
                {
                    this.phonemes[num] = this.MIXED_VOWEL[i][2];
                    return true;
                }
            }
            return false;
        },
        mixFinal : function ( inputCode ){
            if (inputCode <= 40) return false;
            for(var i = 0; i < this.MIXED_JONG_CONSON.length; i++){
                if (this.MIXED_JONG_CONSON[i][0] == this.phonemes[2] && this.MIXED_JONG_CONSON[i][1] == inputCode){
                    this.phonemes[3] = this.phonemes[2];
                    this.phonemes[4] = inputCode;
                    this.phonemes[2] = this.MIXED_JONG_CONSON[i][2];
                    return true;
                }
            }
            return false;
        },
        calculateHangul : function( cho, joong, jong ){
            return String.fromCharCode( cho * 21 * 28 + (joong - 19) * 28 + (jong - 40) + 0xac00 );
        },
        combineHangul : function( status ){
            switch ( status ){
                case 1: return this.calculateHangul(this.phonemes[0], this.phonemes[1], 40);
                case 2: return this.calculateHangul(this.phonemes[0], this.phonemes[1], this.phonemes[2]);
                case 3: return this.calculateHangul(this.phonemes[0], this.phonemes[1], this.phonemes[3]);
            }
            return "";
        },
        toFinal : function( code ){
            switch ( code ){
                case 0: return 41;  // ㄱ
                case 1: return 42;  // ㄲ
                case 2: return 44;  // ㄴ
                case 3: return 47;  // ㄷ
                case 5: return 48;  // ㄹ
                case 6: return 56;  // ㅁ
                case 7: return 57;  // ㅂ
                case 9: return 59;  // ㅅ
                case 10: return 60; // ㅆ
                case 11: return 61; // ㅇ
                case 12: return 62; // ㅈ
                case 14: return 63; // ㅊ
                case 15: return 64; // ㅋ
                case 16: return 65; // ㅌ
                case 17: return 66; // ㅍ
                case 18: return 67; // ㅎ
            }
            return -1;
        },
        toInitial : function ( code ){
            switch (code){
                case 41: return 0;  // ㄱ
                case 42: return 1;  // ㄲ
                case 44: return 2;  // ㄴ
                case 47: return 3;  // ㄷ
                case 48: return 5;  // ㄹ
                case 56: return 6;  // ㅁ
                case 57: return 7;  // ㅂ
                case 59: return 9;  // ㅅ
                case 60: return 10; // ㅆ
                case 61: return 11; // ㅇ
                case 62: return 12; // ㅈ
                case 63: return 14; // ㅊ
                case 64: return 15; // ㅋ
                case 65: return 16; // ㅌ
                case 66: return 17; // ㅍ
                case 67: return 18; // ㅎ
            }
            return -1;
        },
        decomposeConsonant : function ( ){
            var i = 0;
            if (this.phonemes[3] > 40 || this.phonemes[4] > 40){
                do{
                    if (this.DIVIDE_JONG_CONSON[i][2] == this.phonemes[2]){
                        this.phonemes[3] = this.DIVIDE_JONG_CONSON[i][0];
                        this.phonemes[4] = this.DIVIDE_JONG_CONSON[i][1];
                        this.completeWord = this.combineHangul( 3 );
                        this.phonemes[0] = this.toInitial(this.phonemes[4]);
                        return;
                    }
                }while (++i < 13);
            }
            this.completeWord = this.combineHangul( 1 );
            this.phonemes[0] = this.toInitial(this.phonemes[2]);
        },
        combineIngWord : function( status ){
            switch ( status ){
                case 0:
                case 1:
                case 2:
                    this.ingWord = this.SOUND_TABLE[this.phonemes[0]];
                    break;
                case 3:
                case 4:
                    this.ingWord = this.combineHangul(1);
                    break;
                case 5:
                case 6:
                    this.ingWord = this.combineHangul(2);
                    break;
            }
        },
        removeIngWord : function (word){
            var iWord ="";
            if(typeof word.length == 'undefined'){
                return;
            }else {
                iWord = word.charCodeAt(0);
            }
            if (iWord < 0xac00 || iWord > 0xd7a3){
                this.ingWord = ""; //null
                return this.H_STATUS.H_FIRST;
            }
            var iFirstWord = Math.floor(Math.floor((iWord - 0xac00) / 28) / 21);  //초성
            var iMiddleWord = Math.floor((iWord - 0xac00)/ 28) % 21;  //중성
            var iLastWord = (iWord - 0xac00) % 28;       //종성
            //console.log(iFirstWord + " - " + iMiddleWord + " - " + iLastWord);
            this.phonemes[0] = iFirstWord; //초성저장

            if (iLastWord == 0)  //종성이 없는 경우
            {
                this.ingWord = this.SOUND_TABLE[this.phonemes[0]];
                return this.H_STATUS.H_FIRST_V;
            }
            this.phonemes[1] = iMiddleWord + 19; //중성저장
            iLastWord += 40;

            for (var i = 0; i < 13; i++){
                if (iLastWord == this.DIVIDE_JONG_CONSON[i][2]){
                    this.ingWord = this.combineHangul( 3 );
                    this.phonemes[2] = this.DIVIDE_JONG_CONSON[i][0]; // 종성저장
                    return this.H_STATUS.H_END_EXCEPTION;
                }
            }
            this.ingWord = this.combineHangul( 1 );
            return this.H_STATUS.H_MIDDLE;
        },

        writeOne : function( keyCode ){

            if(this.isAlt || this.isCtrl){ // 명령키 조합
                return this.completeWord;
            }
            var mKeyCode = 0;
            if(keyCode >= 65 && keyCode <= 90){ //한글 or 영어
                if(this.isKorean){ //한글
                    this.mode = "ko";
                    mKeyCode = this.keyTable[keyCode - 65];
                    if(this.isShift){
                        mKeyCode = this.keyTableShift[keyCode - 65];
                    }
                }else{ //영어
                    this.mode = "en";
                    if(this.ingWord != ""){
                        this.completeText += this.ingWord;
                        this.ingWord = "";
                    }
                    if(this.isShift){
                        this.completeText += String.fromCharCode(keyCode);
                    }else{
                        this.completeText += String.fromCharCode(keyCode).toLocaleLowerCase();
                    }
                    this.nowStatus = this.H_STATUS.H_FIRST;
                    return this.completeWord;
                }
            }else if(keyCode == 13 || keyCode == 32 || keyCode == 8){
                switch(keyCode){
                    case 32 : mKeyCode = -2; break; //space
                    case 13 : mKeyCode = -3; break; //enter
                    case  8 : mKeyCode = -4; break; //backspace
                }
            }else{//숫자 및 특수기호
                if(keyCode >= 48 && keyCode <= 57 && !this.isShift){ //숫자
                    this.mode = "num";
                    var num = keyCode - 48;
                    if(this.ingWord != ""){
                        this.completeText += this.ingWord;
                        this.ingWord = "";
                    }
                    this.completeText += num;
                    this.nowStatus = this.H_STATUS.H_FIRST;
                    return this.completeWord;
                }
                if(keyCode >= 96 && keyCode <= 105){ // 오른쪽 키패드 숫자
                    this.mode = "num";
                    num = keyCode - 96;
                    if(this.ingWord != ""){
                        this.completeText += this.ingWord;
                        this.ingWord = "";
                    }
                    this.completeText += num;
                    this.nowStatus = this.H_STATUS.H_FIRST;
                    return this.completeWord;
                }
                if(keyCode >= 48 && keyCode <= 57 && this.isShift){ //숫자와 붙어 있는 기호
                    var symbol = [')', '!', '@', '#', '$', '%', '^', '&', '*', '('];
                    var sym = symbol[keyCode - 48];
                    if(this.ingWord != ""){
                        this.completeText += this.ingWord;
                        this.ingWord = "";
                    }
                    this.completeText += sym;
                    this.nowStatus = this.H_STATUS.H_FIRST;
                    return this.completeWord;
                }
                if(keyCode in this.specialChar){
                    var second = 0;
                    if(this.isShift)
                        second = 1;
                    if(this.ingWord != ""){
                        this.completeText += this.ingWord;
                        this.ingWord = "";
                    }
                    this.completeText += this.specialChar[keyCode][second];
                    this.nowStatus = this.H_STATUS.H_FIRST;
                    return this.completeWord;
                }

                return this.completeWord;
            }

            this.completeWord = "";
            if (mKeyCode < 0){
                this.nowStatus = this.H_STATUS.H_FIRST;
                if (mKeyCode == -2){ // 띄어쓰기
                    if (this.ingWord != ""){
                        this.completeText += this.ingWord + " ";
                        //completeText += " ";
                    }else
                        this.completeText += " ";
                    this.ingWord = "";
                }else if (mKeyCode == -3){  // 내려쓰기
                    if (this.ingWord != "")
                        this.completeText += this.ingWord;
                    this.completeText += "\n";
                    this.ingWord = "";
                }else if (mKeyCode == -4){ // 지우기
                    if (this.ingWord == ""){
                        if (this.completeText.length > 0){
                            this.completeText = this.completeText.substring(0, this.completeText.length - 1);
                            //if (completeText.Right(1) == "\n")
                            //    completeText = completeText.Left(completeText.length - 2);
                            //else
                            //    completeText = completeText.Left(completeText.length - 1);
                        }
                    }else{
                        this.nowStatus = this.removeIngWord(this.ingWord);
                    }
                }
                return this.completeWord;
            }

            switch( this.nowStatus ){
                case this.H_STATUS.H_FIRST : //0
                    this.phonemes[0] = mKeyCode;
                    this.ingWord = this.SOUND_TABLE[this.phonemes[0]];
                    this.nowStatus = mKeyCode > 18 ? this.H_STATUS.H_FIRST_C : this.H_STATUS.H_FIRST_V;
                    break;
                case this.H_STATUS.H_FIRST_C : //2
                    if(mKeyCode > 18){              //모음
                        if( !this.mixVowel( 0, mKeyCode ) ){
                            this.completeWord = this.SOUND_TABLE[this.phonemes[0]];
                            this.phonemes[0] = mKeyCode;
                        }
                    }else {  //자음
                        this.completeWord = this.SOUND_TABLE[this.phonemes[0]];
                        this.phonemes[0] = mKeyCode;
                        this.nowStatus = this.H_STATUS.H_FIRST_V;
                    }
                    break;
                case this.H_STATUS.H_FIRST_V : //1
                    if( mKeyCode > 18 ){
                        this.phonemes[1] = mKeyCode;
                        this.nowStatus = this.H_STATUS.H_MIDDLE;
                    }else{
                        if( !this.mixInitial( mKeyCode ) ){
                            this.completeWord = this.SOUND_TABLE[this.phonemes[0]];
                            this.phonemes[0] = mKeyCode;
                            this.nowStatus = this.H_STATUS.H_FIRST_V;
                        }
                    }
                    break;
                case this.H_STATUS.H_MIDDLE : //3
                    if( mKeyCode > 18 ){
                        if( !this.mixVowel(1, mKeyCode )){
                            this.completeWord = this.combineHangul( 1 );
                            this.phonemes[0] = mKeyCode;
                            this.nowStatus = this.H_STATUS.H_FIRST_C;
                        }
                    }else{ // 자음
                        finalCode = this.toFinal( mKeyCode );
                        if( finalCode > 0 ){
                            this.phonemes[2] = finalCode;
                            this.nowStatus = this.H_STATUS.H_END_STATE;
                        }else{ // 종성 불가 자음
                            this.completeWord = this.combineHangul( 1 );
                            this.phonemes[0] = mKeyCode;
                            this.nowStatus = this.H_STATUS.H_FIRST_V;
                        }
                    }
                    break;
                case this.H_STATUS.H_END : //4
                    if ( mKeyCode > 18 ){
                        this.completeWord = this.combineHangul( 1 );
                        this.phonemes[0] = mKeyCode;
                        this.nowStatus = this.H_STATUS.H_FIRST;
                    }else{
                        finalCode = this.toFinal(mKeyCode);
                        if ( finalCode > 0 ){
                            this.phonemes[2] = finalCode;
                            this.nowStatus  = this.H_STATUS.H_END_STATE;
                        }else{
                            this.completeWord = this.combineHangul( 1 );
                            this.phonemes[0] = mKeyCode;
                            this.nowStatus  = this.H_STATUS.H_FIRST;
                        }
                    }
                    break;
                case this.H_STATUS.H_END_STATE : //5
                    if ( mKeyCode > 18 ){
                        this.completeWord = this.combineHangul( 1 );
                        this.phonemes[0] = this.toInitial( this.phonemes[2] );
                        this.phonemes[1] = mKeyCode;
                        this.nowStatus = this.H_STATUS.H_MIDDLE;
                    }else{
                        var finalCode = this.toFinal( mKeyCode );
                        if ( finalCode > 0 ){
                            this.nowStatus = this.H_STATUS.H_END_EXCEPTION;
                            if ( !this.mixFinal( finalCode ) ){
                                this.completeWord = this.combineHangul( 2 );
                                this.phonemes[0] = mKeyCode;
                                this.nowStatus = this.H_STATUS.H_FIRST_V;
                            }
                        }else{
                            this.completeWord = this.combineHangul( 2 );
                            this.phonemes[0] = mKeyCode;
                            this.nowStatus = this.H_STATUS.H_FIRST_V;
                        }
                    }
                    break;
                case this.H_STATUS.H_END_EXCEPTION : //6
                    if (mKeyCode > 18){
                        this.decomposeConsonant();
                        this.phonemes[1] = mKeyCode;
                        this.nowStatus = this.H_STATUS.H_MIDDLE;
                    }else{
                        var jungCode = this.toFinal( mKeyCode );
                        if (jungCode > 0){
                            this.nowStatus = this.H_STATUS.H_END_EXCEPTION;

                            if ( !this.mixFinal( jungCode ) ){
                                this.completeWord = this.combineHangul( 2 );
                                this.phonemes[0] = mKeyCode;
                                this.nowStatus = this.H_STATUS.H_FIRST_V;
                            }
                        }else{
                            this.completeWord = this.combineHangul( 2 );
                            this.phonemes[0] = mKeyCode;
                            this.nowStatus = this.H_STATUS.H_FIRST_V;
                        }
                    }
                    break;
            }
            this.combineIngWord( this.nowStatus );
            if( this.completeWord != "" ){
                this.completeText += this.completeWord;
                //console.log("now wording : " + this.completeText + this.ingWord);
            }
            return this.completeWord;
        }
    };
})();





