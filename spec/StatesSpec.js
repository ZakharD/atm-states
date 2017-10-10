describe("States", function() {
  var StatesService = require('../states.js');
  var log, settings, s;

  beforeEach(function() {
    log = {
      info: function() {
      },
      error: function() {
      }
    };
    
    settings = {
      get: function() {
        return {};
      },
      set: function(value){
      }
    };

    s = new StatesService(settings, log);
  });

  describe("getEntry()", function(){
    it("should get entry 1", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 1)).toEqual('A');
    });

    it("should get entry 2", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 2)).toEqual('BCD');
    }) ;
    
    it("should get entry 3", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 3)).toEqual('EFG');
    });

    it("should get entry 4", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 4)).toEqual('HIJ');
    });

    it("should get entry 5", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 5)).toEqual('KLM');
    });

    it("should get entry 6", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 6)).toEqual('NOP');
    });

    it("should get entry 7", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 7)).toEqual('QRS');
    });

    it("should get entry 8", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 8)).toEqual('TUV');
    });

    it("should get entry 9", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 9)).toEqual('WXY');
    });

    it("should get entry 10", function() {
      expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 10)).toBeNull();
    });
  });  

  describe("parseState()", function(){
    it("should return null if state number is invalid", function() {
      expect(s.parseState('XYZA870500128002002002001127')).toBeNull();
    });


    it("should parse state A properly", function() {
      var parsed = { 
        description: 'Card read state',
        number: '000', 
        type: 'A', 
        screen_number: '870', 
        good_read_next_state: '500', 
        error_screen_number: '128', 
        read_condition_1: '002', 
        read_condition_2: '002', 
        read_condition_3: '002', 
        card_return_flag: '001', 
        no_fit_match_next_state: '127',
        states_to: ['500', '127']
      };
      expect(s.parseState('000A870500128002002002001127')).toEqual(parsed);
    });

    it("should parse state B properly", function() {
      var parsed = { 
        number: '024', 
        type: 'B', 
        description: 'PIN Entry state',
        screen_number: '024', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        local_pin_check_good_next_state: '026', 
        local_pin_check_max_bad_pins_next_state: '026', 
        local_pin_check_error_screen: '138', 
        remote_pin_check_next_state: '026', 
        local_pin_check_max_retries: '003',
        states_to: [ '002', '131', '026', '026', '026' ]
      };
      expect(s.parseState('024B024002131026026138026003')).toEqual(parsed);
    });

    it("should parse state b properly", function() {
      var parsed = { 
        number: '230', 
        type: 'b', 
        description: 'Customer selectable PIN state',
        first_entry_screen_number: '063', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        good_read_next_state: '232', 
        csp_fail_next_state: '000', 
        second_entry_screen_number: '064', 
        mismatch_first_entry_screen_number: '065', extension_state: '231',
        states_to: [ '002', '131', '232', '000' ]
      };
      expect(s.parseState('230b063002131232000064065231')).toEqual(parsed);
    });

    it("should parse state C properly", function() {
      var parsed ={ 
        description: 'Envelope Dispenser state', 
        number: '634', 
        type: 'C', 
        next_state: '631',
        states_to: [ '631' ],
      };
      expect(s.parseState('634C631791092174618362840503')).toEqual(parsed);
    });

    it("should parse state D properly", function() {
      var parsed ={ 
        number: '003', 
        type: 'D', 
        description:'PreSet Operation Code Buffer',
        next_state: '024', 
        clear_mask: '000', 
        A_preset_mask: '128', 
        B_preset_mask: '001', 
        C_preset_mask: '002', 
        D_preset_mask: '003', 
        extension_state: '005',
        states_to: [ '024' ]
      };
      expect(s.parseState('003D024000128001002003004005')).toEqual(parsed);
    });

    it("should parse state E properly", function() {
      var parsed = { 
        number: '141', 
        type: 'E',
        description: 'Four FDK selection state',
        screen_number: '141', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_A_next_state: '255', 
        FDK_B_next_state: '255', 
        FDK_C_next_state: '571', 
        FDK_D_next_state: '132', 
        buffer_location: '000',
        states_to: [ '002', '131', '255', '255', '571', '132' ]
      };
      expect(s.parseState('141E141002131255255571132000')).toEqual(parsed);        
    });

    it("should parse state F properly", function() {
      var parsed = { 
        number: '219', 
        type: 'F',
        description: 'Amount entry state',
        screen_number: '069', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_A_next_state: '220', 
        FDK_B_next_state: '255', 
        FDK_C_next_state: '220', 
        FDK_D_next_state: '219', 
        amount_display_screen: '006',
        states_to: [ '002', '131', '220', '255', '220', '219' ]
      };
      expect(s.parseState('219F069002131220255220219006')).toEqual(parsed);        
    });

    it("should parse state G properly", function() {
      var parsed = { 
        number: '073', 
        type: 'G',
        description: 'Amount check state',
        amount_check_condition_true: '074', 
        amount_check_condition_false: '07T', 
        buffer_to_check: 'YUG', 
        integer_multiple_value: 'HJV', 
        decimal_places: 'BN3', 
        currency_type: 'QWE', 
        amount_check_condition: 'ASD' 
      };
      expect(s.parseState('073G07407TYUGHJVBN3QWEASDZXC')).toEqual(parsed);        
    });

    it("should parse state H properly", function() {
      var parsed = { 
        number: '089', 
        type: 'H', 
        description: 'Information Entry State',
        screen_number: '564', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_A_next_state: '090', 
        FDK_B_next_state: '255', 
        FDK_C_next_state: '090', 
        FDK_D_next_state: '089', 
        buffer_and_display_params: '003',
        states_to: [ '002', '131', '090', '255', '090', '089' ]
      };
      expect(s.parseState('089H564002131090255090089003')).toEqual(parsed);        
    });

    it("should parse state I properly", function() {
      var parsed = {
        number: '027', 
        type: 'I', 
        description: 'Transaction request state',
        screen_number: '025', 
        timeout_next_state: '146', 
        send_track2: '001', 
        send_track1_track3: '000', 
        send_operation_code: '001', 
        send_amount_data: '001', 
        send_pin_buffer: '001', 
        send_buffer_B_buffer_C: '003',
        states_to: [ '146' ],
      };
      expect(s.parseState('027I025146001000001001001003')).toEqual(parsed);        
    });

    it("should parse state J properly", function() {
      var parsed = { 
        number: '002', 
        type: 'J',
        description: 'Close state',
        receipt_delivered_screen: '132', 
        next_state: '000', 
        no_receipt_delivered_screen: '132', 
        card_retained_screen_number: '136', 
        statement_delivered_screen_number: '132', 
        bna_notes_returned_screen: '081', 
        extension_state: '178'
      };
      expect(s.parseState('002J132000132136132000081178')).toEqual(parsed);        
    });

    it("should parse state k properly", function() {
      var parsed = { 
        number: '515', 
        type: 'k', 
        description: 'Smart FIT check state',
        good_read_next_state: '001', 
        card_return_flag: '001', 
        no_fit_match_next_state: '127',
        states_to: [ '001' ]
      };
      expect(s.parseState('515k000001000000000000001127')).toEqual(parsed);        
    });

    it("should parse state K properly", function() {
      var parsed = { 
        number: '001', 
        type: 'K',
        description: 'FIT Switch state',
        states_to: [ '003', '004', '004', '127', '127', '127', '127', '127' ] 
      };
      expect(s.parseState('001K003004004127127127127127')).toEqual(parsed);        
    });

    it("should parse state m properly", function() {
      var parsed = {
        description: 'PIN & Language Select State',
        number: '172',
        type: 'm',
        screen_number: '138',
        timeout_next_state: '002',
        cancel_next_state: '131',
        next_state_options_extension_state: '173',
        operation_codes_extension_state: '255',
        buffer_positions: '255',
        FDK_active_mask: '570',
        multi_language_screens_extension_state: '255'
      };
      expect(s.parseState('172m138002131173255255570255')).toEqual(parsed);        
    });

    it("should parse state U properly", function() {
      var parsed = {
        description: 'Device Fitness Flow Select State',
        number: '189',
        type: 'U',
        device_number: '035',
        device_available_next_state: '190',
        device_identifier_grafic: '113',
        device_unavailable_next_state: '201',
        device_subcomponent_identifier: '00q'
      };
      expect(s.parseState('189U03519011320100q000000000')).toEqual(parsed);        
    });

    it("should parse state W properly", function() {
      var parsed = { 
        number: '035', 
        type: 'W',
        description: 'FDK Switch state',
        states: { 
          A: '181', 
          B: '037', 
          C: '255', 
          D: '127', 
          F: '031', 
          G: '034', 
          H: '250', 
          I: '186' 
        },
        states_to: [ '181', '037', '255', '127', '031', '034', '250', '186' ]
      }
      expect(s.parseState('035W181037255127031034250186')).toEqual(parsed);        
    });

    it("should parse state X properly", function() {
      var parsed = { 
        number: '037', 
        type: 'X',
        description: 'FDK information entry state',
        screen_number: '037', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_next_state: '038', 
        extension_state: '039', 
        buffer_id: '010', 
        FDK_active_mask: '255',
        states_to: [ '002', '131', '038' ]
      };
      expect(s.parseState('037X037002131038039010255000')).toEqual(parsed);        
    });

    it("should parse state Y properly", function() {
      var parsed= { 
        number: '011', 
        type: 'Y',
        description: 'Eight FDK selection state',
        screen_number: '023', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_next_state: '012', 
        extension_state: '255', 
        buffer_positions: '004', 
        FDK_active_mask: '052', 
        multi_language_screens: '013',
        states_to: [ '002', '131', '012' ]
      };
      expect(s.parseState('011Y023002131012255004052013')).toEqual(parsed);        
    });

    it("should parse state Z properly", function() {
      var parsed = { 
        number: '037', 
        type: 'Z',
        description: 'Extension state',
        entries: [ null, 'Z', '123', '456', '789', '0AB', 'CDE', 'FGH', 'IJK', 'LMN' ] 
      };
      expect(s.parseState('037Z1234567890ABCDEFGHIJKLMN')).toEqual(parsed);        
    });

    it("should parse state > properly", function() {
      var parsed = { 
        number: '037', 
        type: '>',
        description: 'Cash deposit state',
        cancel_key_mask: '701', 
        deposit_key_mask: '928', 
        add_more_key_mask: '362', 
        refund_key_mask: '810', 
        extension_state_1: '280', 
        extension_state_2: '293', 
        extension_state_3: '751' 
      };
      expect(s.parseState('037>701928362810280293751745')).toEqual(parsed);        
    });

    it("should parse state / properly", function() {
      var parsed = { 
        number: '299', 
        type: '/',
        description: 'Complete ICC selection',
        please_wait_screen_number: '025', 
        icc_app_name_template_screen_number: '860', 
        icc_app_name_screen_number: '861', 
        extension_state: '300',
      }
      expect(s.parseState('299/025860861300000000000000')).toEqual(parsed);        
    });

    it("should parse state ? properly", function() {
      var parsed = { 
        number: '301', 
        type: '?', 
        description: 'Set ICC transaction data', 
        next_state: '560', 
        currency_type: '001', 
        transaction_type: '001', 
        amount_authorized_source: '031', 
        amount_other_source: '040', 
        amount_too_large_next_state: '000'
      }
      expect(s.parseState('301?560001001031040000000000')).toEqual(parsed);        
    });

    it("should parse state z properly", function() {
      var parsed ={ 
        number: '462', 
        type: 'z', 
        description: 'EMV ICC Application Switch state', 
        next_state: '001', 
        terminal_aid_extension_1: '000', 
        next_state_extension_1: '000', 
        terminal_aid_extension_2: '019', 
        next_state_extension_2: '463', 
        terminal_aid_extension_3: '464', 
        next_state_extension_3: '465',
      }
      expect(s.parseState('462z001000000019463464465000')).toEqual(parsed);        
    });

    it("should parse state + properly", function() {
      var parsed = { 
        description: 'Begin ICC Initialization state', 
        number: '500', 
        type: '+', 
        icc_init_started_next_state: '501', 
        icc_init_not_started_next_state: '001', 
        icc_init_requirement: '001', 
        automatic_icc_app_selection_flag: '000', 
        default_app_label_usage_flag: '000', 
        cardholder_confirmation_flag: '000',
        states_to: [ '501', '001' ],
      }
      expect(s.parseState('500+501001001000000000000000')).toEqual(parsed);        
    });

    it("should parse state , properly", function() {
      var parsed = { 
        description: 'Complete ICC Initialization state', 
        number: '501', 
        type: ',', 
        please_wait_screen_number: '000', 
        icc_init_success: '502', 
        card_not_smart_next_state: '001', 
        no_usable_applications_next_state: '001', 
        icc_app_level_error_next_state: '001', 
        icc_hardware_level_error_next_state: '001', 
        no_usable_applications_fallback_next_state: '167' 
      };
      expect(s.parseState('501,000502001001001001167000')).toEqual(parsed);        
    });

    it("should parse state - properly", function() {
      var parsed = { 
        description: 'Automatic Language Selection state', 
        number: '502', 
        type: '-', 
        language_match_next_state: '505', 
        no_language_match_next_state: '503',
      };
      expect(s.parseState('502-505503000000000000000000')).toEqual(parsed);        
    });

    it("should parse state . properly", function() {
      var parsed = { 
        description: 'Begin ICC Application Selection & Initialization state', 
        number: '505', 
        type: '.', 
        cardholder_selection_screen_number: '039', 
        FDK_template_screen_numbers_extension_state: '510', 
        action_keys_extension_state_number: '511', 
        exit_paths_extension_state_number: '512', 
        single_app_cardholder_selection_screen_number: '000',
      };
      expect(s.parseState('505.039510511512000000000000')).toEqual(parsed);        
    });

    it("should parse state ; properly", function() {
      var parsed = { 
        description: 'ICC Re-initialize state', 
        number: '569', 
        type: ';', 
        good_read_next_state: '026', 
        processing_not_performed_next_state: '026', 
        reinit_method: '000', 
        chip_power_control: '000', 
        reset_terminal_pobjects: '000',
      };
      expect(s.parseState('569;026026000000000000000000')).toEqual(parsed);        
    });

    it("should parse state & properly", function() {
      var parsed = { 
        description: 'Barcode Read State', 
        number: '109',
        type: '&',
        screen_number: '276',
        good_read_next_state: '085',
        cancel_next_state: '131',
        error_next_state: '131',
        timeout_next_state: '002',
      };
      expect(s.parseState('109&276085131131002004255000')).toEqual(parsed);        
    });

    it("should throw error if state data is invalid", 
      function() {
      expect(s.parseState('000"8')).toBeNull();
    });
  });

  describe('addStateArray()', function(){
    it("should add valid state passed as array object", function() {
      var parsed = { 
        number: '000', 
        type: 'A', 
        description: 'Card read state',
        screen_number: '870', 
        good_read_next_state: '500', 
        error_screen_number: '128', 
        read_condition_1: '002', 
        read_condition_2: '002', 
        read_condition_3: '002', 
        card_return_flag: '001', 
        no_fit_match_next_state: '127',
        states_to: [ '500', '127' ]
      };

      expect(s.addStateArray(['000', 'A', '870', '500', '128', '002', '002', '002', '001', '127'])).toBeTruthy();
      expect(s.get('000')).toEqual(parsed);
    });

    it("should add valid state passed as array object with unpadded values", function() {
      var parsed = { 
        number: '000', 
        type: 'A', 
        description: 'Card read state',
        screen_number: '870', 
        good_read_next_state: '500', 
        error_screen_number: '128', 
        read_condition_1: '002', 
        read_condition_2: '002', 
        read_condition_3: '002', 
        card_return_flag: '021', 
        no_fit_match_next_state: '127',
        states_to: [ '500', '127' ]
      };

      expect(s.addStateArray(['0', 'A', '870', '500', '128', '2', '2', '2', '21', '127'])).toBeTruthy();
      expect(s.get('000')).toEqual(parsed);
    });

    it("should not add state with the incorrect state entries", function() {
      expect(s.addStateArray(['0', 'A', '870', '500', '128', '2', '', '0', '21', '9999999999'])).toBeFalsy();
    });

    it("should not add state with the incorrect state type", function() {
      expect(s.addStateArray(['0', 'AX', '870', '500', '128', '2', '2', '0', '21', '000'])).toBeFalsy();
    });

    it("should not add state with the empty state type", function() {
      expect(s.addStateArray(['0', '', '870', '500', '128', '2', '2', '0', '21', '000'])).toBeFalsy();
    });

    it("should add valid state passed as array of numbers", function() {
      var parsed = { 
        description: 'Close state', 
        number: '002', 
        type: 'J', 
        receipt_delivered_screen: '132', 
        next_state: '000', 
        no_receipt_delivered_screen: '132', 
        card_retained_screen_number: '136', 
        statement_delivered_screen_number: '132', 
        bna_notes_returned_screen: '120', 
        extension_state: '264' 
      };

      expect(s.addStateArray([2, 'J', 132, 0, 132, 136, 132, 0, 120, 264, 0])).toBeTruthy();
      expect(s.get('002')).toEqual(parsed);
    });
  })

  describe("addState()", function(){
    it("should return false when empty data passed", function() {
      expect(s.addState()).toEqual(false);
    });

    it("should return false when empty string passed", function() {
      expect(s.addState('')).toEqual(false);
    });

    it("should add valid state passed as string", function() {
      var parsed = { 
        number: '000', 
        type: 'A', 
        description: 'Card read state',
        screen_number: '870', 
        good_read_next_state: '500', 
        error_screen_number: '128', 
        read_condition_1: '002', 
        read_condition_2: '002', 
        read_condition_3: '002', 
        card_return_flag: '001', 
        no_fit_match_next_state: '127',
        states_to: [ '500', '127' ]
      };

      expect(s.addState('000A870500128002002002001127')).toBeTruthy();
      expect(s.get('000')).toEqual(parsed);
    });

    it("should add valid state passed as array of numbers", function() {
      var parsed = { 
        description: 'Close state', 
        number: '002', 
        type: 'J', 
        receipt_delivered_screen: '132', 
        next_state: '000', 
        no_receipt_delivered_screen: '132', 
        card_retained_screen_number: '136', 
        statement_delivered_screen_number: '132', 
        bna_notes_returned_screen: '120', 
        extension_state: '264' 
      };

      expect(s.addState([2, 'J', 132, 0, 132, 136, 132, 0, 120, 264, 0])).toBeTruthy();
      expect(s.get('002')).toEqual(parsed);
    });
  });

  describe("add()", function(){
    it("should add states passed as array", function() {
      var states = ['000A870500128002002002001127', '001K003004004127127127127127', '002J132000132136132000081178', '003D024000128000000000000000', '004D024000000128000000000000'];
      expect(s.add(states)).toBeTruthy();
    });

    it("should add single state passed as a string", function() {
      var state = '000A870500128002002002001127';
      expect(s.add(state)).toBeTruthy();
    });

    it("should return false if one of the states is invalid", function() {
      var states = ['xyzAxyz500128002002002001127', '004D024000000128000000000000'];
      expect(s.add(states)).toBeFalsy();
    });
  });

  describe("getNodes()", function(){
    it("should return single state node", function(){
      var state = '000A870500128002002002001127';
      expect(s.addState(state)).toBeTruthy();

      var nodes = [{'id': '000', 'label': '000 A', 'level': 1}];
      expect(s.getNodes()).toEqual(nodes);
    });

    it("should return multiple state nodes", function(){
      var states = ['000A870500128002002002001127', '500K003004004127127127127127'];
      expect(s.add(states)).toBeTruthy();
      
      var nodes = [
        { 'id': '500', 'label': '500 K', 'level': 2 },
        { 'id': '000', 'label': '000 A', 'level': 1 }, 
      ];
      expect(s.getNodes()).toEqual(nodes);
    })
  })

  describe("getEdges()", function(){
    it("should return empty edges where there is no states", function(){
      var edges = [];
      expect(s.getEdges()).toEqual(edges);
    })

    it("should return edges when single state added", function(){
      var edges = [
        {'from': '000', 'to': '500'},
        {'from': '000', 'to': '127'}
      ];
      var states = ['000A870500128002002002001127',];
      
      expect(s.add(states)).toBeTruthy();
      expect(s.getEdges()).toEqual(edges);
    })

    it("should return edges when added multiple states", function(){
      var edges = [
        {'from': '000', 'to': '500'},
        {'from': '000', 'to': '127'},
        {'from': '001', 'to': '003'},
        {'from': '001', 'to': '004' }, 
        {'from': '001', 'to': '004' }, 
        {'from': '001', 'to': '127' }, 
        {'from': '001', 'to': '127' }, 
        {'from': '001', 'to': '127' }, 
        {'from': '001', 'to': '127' }, 
        {'from': '001', 'to': '127' }
      ];
      var states = ['000A870500128002002002001127', '001K003004004127127127127127'];
      
      expect(s.add(states)).toBeTruthy();
      expect(s.getEdges()).toEqual(edges);
    })
  })

  describe("clearStateLevels()", function(){
    it("should clear state levels", function(){
      s.states = {
        '000': { level: 3 },
        '001': { level: 4 },
      };

      s.clearStateLevels();
      expect(s.states['000']['level']).toBeNull();
    });
  });

  describe("setStateLevels()", function(){
    it("should set state levels", function(){
      s.states = {
        '003': { type: 'Z'},
        '197': { type: 'Z'},
        '345': { type: 'Z'},
      };

      s.setStateLevels(['003', '197', '345'], 14);
      expect(s.states['003']['level']).toEqual(14);
    })
  });

  describe("updateStateLevels()", function(){
    it("should update state levels with depth 1", function(){
      var parsed = { 
        number: '000', 
        type: 'A', 
        description: 'Card read state',
        screen_number: '870', 
        good_read_next_state: '500', 
        error_screen_number: '128', 
        read_condition_1: '002', 
        read_condition_2: '002', 
        read_condition_3: '002', 
        card_return_flag: '001', 
        no_fit_match_next_state: '127',
        states_to: [ '500', '127' ]
      };

      expect(s.addState('000A870500128002002002001127')).toBeTruthy();
      expect(s.get('000')).toEqual(parsed);

      expect(s.addState('500Zxxxxxxxxxxxxxxxxxxxxxxxx')).toBeTruthy();
      expect(s.addState('127Zxxxxxxxxxxxxxxxxxxxxxxxx')).toBeTruthy();
      s.updateStateLevels();

      expect(s.get('000')['level']).toEqual(1);
      expect(s.get('500')['level']).toEqual(2);
      expect(s.get('127')['level']).toEqual(2);
    })

    it("should update state levels with depth 2", function(){
      // Level 0
      var A000 = { 
        number: '000', 
        type: 'A', 
        description: 'Card read state',
        screen_number: '870', 
        good_read_next_state: '500', 
        error_screen_number: '128', 
        read_condition_1: '002', 
        read_condition_2: '002', 
        read_condition_3: '002', 
        card_return_flag: '001', 
        no_fit_match_next_state: '127',
        states_to: [ '500', '127' ]
      };
      expect(s.addState('000A870500128002002002001127')).toBeTruthy();
      expect(s.get('000')).toEqual(A000);

      // Level 1
      var B500 = { 
        number: '500', 
        type: 'B', 
        description: 'PIN Entry state',
        screen_number: '024', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        local_pin_check_good_next_state: '026', 
        local_pin_check_max_bad_pins_next_state: '026', 
        local_pin_check_error_screen: '138', 
        remote_pin_check_next_state: '026', 
        local_pin_check_max_retries: '003',
        states_to: [ '002', '131', '026', '026', '026' ]
      };
      expect(s.addState('500B024002131026026138026003')).toBeTruthy();
      expect(s.get('500')).toEqual(B500);

      var D127 ={ 
        number: '127', 
        type: 'D', 
        description:'PreSet Operation Code Buffer',
        next_state: '024', 
        clear_mask: '000', 
        A_preset_mask: '128', 
        B_preset_mask: '001', 
        C_preset_mask: '002', 
        D_preset_mask: '003', 
        extension_state: '005',
        states_to: [ '024' ]
      };
      expect(s.addState('127D024000128001002003004005')).toBeTruthy();
      expect(s.get('127')).toEqual(D127);

      // Level 2
      var J002 = { 
        number: '002', 
        type: 'J',
        description: 'Close state',
        receipt_delivered_screen: '132', 
        next_state: '000', 
        no_receipt_delivered_screen: '132', 
        card_retained_screen_number: '136', 
        statement_delivered_screen_number: '132', 
        bna_notes_returned_screen: '081', 
        extension_state: '178'
      };
      expect(s.addState('002J132000132136132000081178')).toBeTruthy();
      expect(s.get('002')).toEqual(J002);

      var J131 = { 
        number: '131', 
        type: 'J',
        description: 'Close state',
        receipt_delivered_screen: '132', 
        next_state: '000', 
        no_receipt_delivered_screen: '132', 
        card_retained_screen_number: '136', 
        statement_delivered_screen_number: '132', 
        bna_notes_returned_screen: '081', 
        extension_state: '178'
      };
      expect(s.addState('131J132000132136132000081178')).toBeTruthy();
      expect(s.get('131')).toEqual(J131);

      var J026 = { 
        number: '026', 
        type: 'J',
        description: 'Close state',
        receipt_delivered_screen: '132', 
        next_state: '000', 
        no_receipt_delivered_screen: '132', 
        card_retained_screen_number: '136', 
        statement_delivered_screen_number: '132', 
        bna_notes_returned_screen: '081', 
        extension_state: '178'
      };
      expect(s.addState('026J132000132136132000081178')).toBeTruthy();
      expect(s.get('026')).toEqual(J026);

      // Updating levels
      s.updateStateLevels();

      expect(s.get('000')['level']).toEqual(1);
      expect(s.get('500')['level']).toEqual(2);
      expect(s.get('127')['level']).toEqual(2);
      expect(s.get('002')['level']).toEqual(3);
      expect(s.get('131')['level']).toEqual(3);
      expect(s.get('026')['level']).toEqual(3);
    })

    it("should not change level if states_to contains the state itself", function(){
      // Level 0
      var A000 = { 
        number: '000', 
        type: 'A', 
        description: 'Card read state',
        screen_number: '870', 
        good_read_next_state: '219', 
        error_screen_number: '128', 
        read_condition_1: '002', 
        read_condition_2: '002', 
        read_condition_3: '002', 
        card_return_flag: '001', 
        no_fit_match_next_state: '127',
        states_to: [ '219', '127' ]
      };
      expect(s.addState('000A870219128002002002001127')).toBeTruthy();
      expect(s.get('000')).toEqual(A000);

      var F219 = { 
        number: '219', 
        type: 'F',
        description: 'Amount entry state',
        screen_number: '069', 
        timeout_next_state: '002', 
        cancel_next_state: '131', 
        FDK_A_next_state: '220', 
        FDK_B_next_state: '255', 
        FDK_C_next_state: '220', 
        FDK_D_next_state: '219', 
        amount_display_screen: '006',
        states_to: [ '002', '131', '220', '255', '220', '219' ]
      };
      expect(s.addState('219F069002131220255220219006')).toBeTruthy();   
      expect(s.get('219')).toEqual(F219);

      s.updateStateLevels();
      expect(s.get('000')['level']).toEqual(1);
      expect(s.get('219')['level']).toEqual(2);

    });
  });

  describe('delete()', function(){
    it('should return false if state does not exist', function(){
      expect(s.delete('219')).toBeFalsy();
    });

    it('should delete state', function(){
      expect(s.addState('219F069002131220255220219006')).toBeTruthy();   
      expect(s.get('219')).not.toBeUndefined();
      
      expect(s.delete('219')).toBeTruthy();
      expect(s.get('219')).toBeUndefined();
    });
  });


});
