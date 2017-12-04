const LevelsService = require('atm-state-levels');

/**
 * [StatesService description]
 * @param {[type]} settings [optional, settings object, created by require('electron-settings')]
 * @param {[type]} log      [optional, log helper]
 * @param {[type]} trace    [optional, trace helper]
 */
function StatesService(settings, log, trace){
  if(settings)
      this.states = settings.get('states');

  if(!this.states)
      this.states = {};
    
  this.levels = new LevelsService();

  /**
   * [getEntry get the state entry, e.g. state entry 3 is a substring of original state string from position 7 to position 10 ]
   * @param  {[type]} data  [state data to parse]
   * @param  {[type]} entry [state entry to get]
   * @return {[type]}       [3-bytes long state entry on success, null otherwise]
   */
  this.getEntry = function(data, entry){
    if(entry > 0 && entry < 2)
      return data.substring(3, 4);
    else if (entry < 10)            
      return data.substring(1 + 3 * (entry - 1), 4 + 3 * (entry - 1));

    return null;
  }

  /**
   * [addStateString add state passed as a string]
   * @param {[type]} state [string, e.g. '000A870500128002002002001127']
   */
  this.addStateString = function(state){
    var parsed = this.parseState(state);
    if(parsed){
      this.states[parsed.number] = parsed;
      if(log && trace)
          log.info('State ' + parsed.number + ' processed:' + trace.object(parsed));
      if(settings)
          settings.set('states', this.states);
      return true;
    }
    else
      return false;
  };

  /**
   * [addStateArray description]
   * @param {[type]} state_array [state object, passed as array, e.g. ['000', 'A', '870', '500', '128', '002', '002', '002', '001', '127']]
   */
  this.addStateArray = function(state_array){
    var state_string = '';

    var valid = true;
    state_array.forEach(entry => {
      if(isNaN(parseInt(entry))){
        // Probably it's a state type entry 
        if(entry.length === 0 || entry.length > 1)
          valid = false;
          
        state_string += entry;
      } else {
        if(entry.toString().length === 3)
          state_string += entry.toString();
        else if(entry.toString().length === 2)
          state_string += '0' + entry.toString();
        else if(entry.toString().length === 1)
          state_string += '00' + entry.toString();
        else if (entry.toString().length === 0)
          state_string += '000';
        else {
          if(log)
            log.error('addStateArray(): invalid state entry: ' + entry);
          valid = false;
        }
      }
    })

    if(!valid)
      return false;

    return this.addStateString(state_string);
  }

  /**
   * [addState description]
   * @param {[type]} state [description]
   * @return {boolean}     [true if state was successfully added, false otherwise]
   */
  this.addState = function(state){
    if(typeof(state) === 'string')
      return this.addStateString(state);
    else if (typeof(state) === 'object')
      return this.addStateArray(state);
    else {
      if(log)
        log.error('addState() Unsupported state object type: ' + typeof(state));
      return false;
    }
  };

  /**
   * [parseState description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  this.parseState = function(data){
    /**
     * [addStateLinks add states_to property to the given state object. After running this function, state.states_to contains state exits]
     * @param {[type]} state      [state]
     * @param {[type]} properties [array of properties, containing the state numbers to go, e.g. ['500', '004']]
     */
    function addStateLinks(state, properties){
      state.states_to = new Set();
      properties.forEach( (property) => {
        state.states_to.add(state[property]);
      });
    };

    var parsed = {};
    parsed.description = '';
    parsed.number = data.substring(0, 3)
    if(isNaN(parsed.number))
      return null;

    parsed.type = this.getEntry(data, 1);
        
    switch(parsed.type){
      case 'A':
        parsed.description = 'Card read state';
        ['screen_number',           /* State entry 2 */
        'good_read_next_state',     /* State entry 3 */
        'error_screen_number',      /* State entry 4 */
        'read_condition_1',         /* State entry 5 */
        'read_condition_2',         /* State entry 6 */
        'read_condition_3',         /* State entry 7 */
        'card_return_flag',         /* State entry 8 */
        'no_fit_match_next_state',  /* State entry 9 */
        ].forEach( (element, index) => {
          parsed[element] = this.getEntry(data, index + 2)
        });
        addStateLinks(parsed, ['good_read_next_state', 'no_fit_match_next_state']);
        break;

        case 'B':
          parsed.description = 'PIN Entry state';
          ['screen_number',
          'timeout_next_state',
          'cancel_next_state',
          'local_pin_check_good_next_state',
          'local_pin_check_max_bad_pins_next_state',
          'local_pin_check_error_screen',
          'remote_pin_check_next_state',
          'local_pin_check_max_retries',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state', 'cancel_next_state', 'local_pin_check_good_next_state', 'local_pin_check_max_bad_pins_next_state', 'remote_pin_check_next_state']);
          break;

        case 'b':
          parsed.description = 'Customer selectable PIN state';
          ['first_entry_screen_number',
          'timeout_next_state',
          'cancel_next_state',
          'good_read_next_state',
          'csp_fail_next_state',
          'second_entry_screen_number',
          'mismatch_first_entry_screen_number',
          'extension_state',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state', 'cancel_next_state', 'good_read_next_state', 'csp_fail_next_state']);
          break;

        case 'C':
          parsed.description = 'Envelope Dispenser state';
          ['next_state',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['next_state',]);
          break;

        case 'D':
          parsed.description = 'PreSet Operation Code Buffer';
          ['next_state',
          'clear_mask',
          'A_preset_mask',
          'B_preset_mask',
          'C_preset_mask',
          'D_preset_mask',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          parsed.extension_state = this.getEntry(data, 9);
          addStateLinks(parsed, ['next_state',]);
          break;

        case 'E':
          parsed.description = 'Four FDK selection state';
          ['screen_number',
          'timeout_next_state',
          'cancel_next_state',
          'FDK_A_next_state',
          'FDK_B_next_state',
          'FDK_C_next_state',
          'FDK_D_next_state',
          'buffer_location',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state', 'cancel_next_state', 'FDK_A_next_state', 'FDK_B_next_state', 'FDK_C_next_state', 'FDK_D_next_state']);
          break;

        case 'F':
          parsed.description = 'Amount entry state';
          ['screen_number',
          'timeout_next_state',
          'cancel_next_state',
          'FDK_A_next_state',
          'FDK_B_next_state',
          'FDK_C_next_state',
          'FDK_D_next_state',
          'amount_display_screen',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state', 'cancel_next_state', 'FDK_A_next_state', 'FDK_B_next_state', 'FDK_C_next_state', 'FDK_D_next_state']);
          break;

        case 'G':
          parsed.description = 'Amount check state';
          ['amount_check_condition_true',
          'amount_check_condition_false',
          'buffer_to_check',
          'integer_multiple_value',
          'decimal_places',
          'currency_type',
          'amount_check_condition',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['amount_check_condition_true', 'amount_check_condition_false']);
          break;

        case 'H':
          parsed.description = 'Information Entry State';
          ['screen_number',
          'timeout_next_state',
          'cancel_next_state',
          'FDK_A_next_state',
          'FDK_B_next_state',
          'FDK_C_next_state',
          'FDK_D_next_state',
          'buffer_and_display_params',
          ].forEach( (element, index) => {
              parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state', 'cancel_next_state', 'FDK_A_next_state', 'FDK_B_next_state', 'FDK_C_next_state', 'FDK_D_next_state']);
          break;

        case 'I':
          parsed.description = 'Transaction request state';
          ['screen_number',
          'timeout_next_state',
          'send_track2',
          'send_track1_track3',
          'send_operation_code',
          'send_amount_data',
          'send_pin_buffer',
          'send_buffer_B_buffer_C',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state',]);
          break;

        case 'J':
          parsed.description = 'Close state';
          ['receipt_delivered_screen',
          'next_state',
          'no_receipt_delivered_screen',
          'card_retained_screen_number',
          'statement_delivered_screen_number',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });

          parsed.bna_notes_returned_screen = this.getEntry(data, 8);
          parsed.extension_state = this.getEntry(data, 9);
                
          if(parsed['next_state'] !== '000')
            addStateLinks(parsed, ['next_state',]);
          break;

        case 'k':
          parsed.description = 'Smart FIT check state';
          parsed.good_read_next_state = this.getEntry(data, 3);
          parsed.card_return_flag = this.getEntry(data, 8);
          parsed.no_fit_match_next_state = this.getEntry(data, 9);
          addStateLinks(parsed, ['good_read_next_state',]);
          break;

        case 'K':
          parsed.description = 'FIT Switch state';
          parsed.states_to = [];
          var i = 2;
          while(i < 10){
            parsed.states_to.push(this.getEntry(data, i));
            i++;
          }
          break;

        case 'm':
          parsed.description = 'PIN & Language Select State';
          ['screen_number', 
           'timeout_next_state',
           'cancel_next_state',
           'next_state_options_extension_state',
           'operation_codes_extension_state',
           'buffer_positions',
           'FDK_active_mask',
           'multi_language_screens_extension_state'
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state', 'cancel_next_state',]);
          break;

        case 'U':
          parsed.description = 'Device Fitness Flow Select State';
          ['device_number', 
           'device_available_next_state',
           'device_identifier_grafic',
           'device_unavailable_next_state',
           'device_subcomponent_identifier'
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['device_available_next_state', 'device_unavailable_next_state',]);
          break;

        case 'W':
          parsed.description = 'FDK Switch state';
          parsed.states = {};
          parsed.states_to = [];
          ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I'].forEach( (element, index) => {
            parsed.states[element] = this.getEntry(data, index + 2)
            parsed.states_to.push(parsed.states[element]);
          });
          break;

        case 'Z':
          /**
           * Accessing Z state entries may be perfromed by state.entries[i] - to get i-th table entry as it's written in NDC's spec. 
           * E.g. state.entries[1] is 'Z', state.entry[4] is "Z state table entry 4"
           */
          parsed.description = 'Extension state'
          parsed.entries = [null, 'Z'];
          for(var i = 2; i < 10; i++)
            parsed.entries.push(this.getEntry(data, i))
          break;

        case 'X':
          parsed.description = 'FDK information entry state';
          ['screen_number', 
          'timeout_next_state', 
          'cancel_next_state', 
          'FDK_next_state', 
          'extension_state', 
          'buffer_id', 
          'FDK_active_mask',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state', 'cancel_next_state', 'FDK_next_state']);
          break;

        case 'Y':
          parsed.description = 'Eight FDK selection state';
          ['screen_number',
          'timeout_next_state',
          'cancel_next_state',
          'FDK_next_state',
          'extension_state',
          'buffer_positions',
          'FDK_active_mask',
          'multi_language_screens',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['timeout_next_state', 'cancel_next_state', 'FDK_next_state']);
          break;

        case '>':
          parsed.description = 'Cash deposit state';
          ['cancel_key_mask',
          'deposit_key_mask',
          'add_more_key_mask',
          'refund_key_mask',
          'extension_state_1',
          'extension_state_2',
          'extension_state_3',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          break;

        case '/':
          parsed.description = 'Complete ICC selection';
          ['please_wait_screen_number',
          'icc_app_name_template_screen_number',
          'icc_app_name_screen_number',
          'extension_state',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          break;

        case '?':
          parsed.description = 'Set ICC transaction data';
          ['next_state',
          'currency_type',
          'transaction_type',
          'amount_authorized_source',
          'amount_other_source',
          'amount_too_large_next_state',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['next_state', 'amount_too_large_next_state']);
          break;

        case 'z':
          parsed.description = 'EMV ICC Application Switch state';
          ['next_state',
          'terminal_aid_extension_1',
          'next_state_extension_1',
          'terminal_aid_extension_2',
          'next_state_extension_2',
          'terminal_aid_extension_3',
          'next_state_extension_3',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          break;

        case '+':
          parsed.description = 'Begin ICC Initialization state';
          ['icc_init_started_next_state',
          'icc_init_not_started_next_state',
          'icc_init_requirement',
          'automatic_icc_app_selection_flag',
          'default_app_label_usage_flag',
          'cardholder_confirmation_flag',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, ['icc_init_started_next_state', 'icc_init_not_started_next_state']);
          break;

        case ',':
          parsed.description = 'Complete ICC Initialization state';
          ['please_wait_screen_number',
          'icc_init_success',
          'card_not_smart_next_state',
          'no_usable_applications_next_state',
          'icc_app_level_error_next_state',
          'icc_hardware_level_error_next_state',
          'no_usable_applications_fallback_next_state',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, [
            'icc_init_success',
            'card_not_smart_next_state',
            'no_usable_applications_next_state',
            'icc_app_level_error_next_state',
            'icc_hardware_level_error_next_state',
            'no_usable_applications_fallback_next_state',
          ]);
          break;

        case '-':
          parsed.description = 'Automatic Language Selection state';
          ['language_match_next_state',
          'no_language_match_next_state',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, [
            'language_match_next_state',
            'no_language_match_next_state',
          ]);
          break;

        case '.':
          parsed.description = 'Begin ICC Application Selection & Initialization state';
          ['cardholder_selection_screen_number',
          'FDK_template_screen_numbers_extension_state',
          'action_keys_extension_state_number',
          'exit_paths_extension_state_number',
          'single_app_cardholder_selection_screen_number',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          break;

        case ';':
          parsed.description = 'ICC Re-initialize state';
          ['good_read_next_state',
          'processing_not_performed_next_state',
          'reinit_method',
          'chip_power_control',
          'reset_terminal_pobjects',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, [
            'good_read_next_state',
            'processing_not_performed_next_state',
          ]);
          break;

        case '&':
          parsed.description = 'Barcode Read State';
          ['screen_number',
           'good_read_next_state',
           'cancel_next_state',
           'error_next_state',
           'timeout_next_state',
          ].forEach( (element, index) => {
            parsed[element] = this.getEntry(data, index + 2)
          });
          addStateLinks(parsed, [
           'good_read_next_state',
           'cancel_next_state',
           'error_next_state',
           'timeout_next_state',
          ]);
          break;

        default:
          if(log)
            log.info('StatesService.parseState(): error processing state ' + parsed.number + ': unsupported state type ' + parsed.type);
          return null;
      }

      return parsed;
  }

  /**
   * [clearStateLevels description]
   * @return {[type]} [description]
   */
  this.clearStateLevels = function(){
    for (var i in this.states){
      var state = this.states[i];
      state.level = null;
    }

    this.levels.clear();
  }

  /**
   * [setStateLevels description]
   * @param {[type]} state_numbers [description]
   * @param {[type]} level         [description]
   */
  this.setStateLevels = function(state_numbers, level){
    if(!state_numbers)
      return;

    state_numbers.forEach(number => {
      var state = this.states[number];

      if( state && !state.level){
        state.level = level;
        this.levels.addState(state.number, level);

        var extension_state = this.getExtensionState(state);
        if(extension_state){
          extension_state.level = level;
           this.levels.addState(extension_state.number, level);
        }

        this.setStateLevels(state.states_to, level + 1);
      }
    });
  };

  /**
   * [updateStateLevels description]
   * @return {[type]} [description]
   */
  this.updateStateLevels = function(){
    this.clearStateLevels();
    
    var state = this.states['000'];
    var level = 1;
    state.level = level;
        
    // Build a graph for states linked to state 000
    this.setStateLevels(state.states_to, ++level);

    // Continue with the states that are not linked directly to 000
    var unlinked_state_numbers = [];
    for (var i in this.states){
      if(this.states[i] && !this.states[i].level)
        unlinked_state_numbers.push(this.states[i].number);
    }

    level = this.levels.getMaxLevel() + 3;  // Add some space to separate the states
    this.setStateLevels(unlinked_state_numbers, ++level);
  };

  /**
   * [getExtensionState description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  this.getExtensionState = function(state){
    var extension_state = null;

    if( state.extension_state && 
        state.extension_state !== '000' &&
        state.extension_state !== '255'){

      extension_state = this.states[state.extension_state];
      if(extension_state && extension_state.type === 'Z')
        return extension_state;
      else 
        return null;
    }

    return extension_state;
  }

  /**
   * [add description]
   * @param {[type]} data [array of data to add]
   * @return {boolean}     [true if data were successfully added, false otherwise]
   */
  this.add = function(data){
    if(typeof data === 'object') {
      for (var i = 0; i < data.length; i++){
        if(!this.addState(data[i])){
          log.info('Error processing state ' + data[i] );
          return false;
        }
      }
      return true;
    } else if (typeof data === 'string') {
      return this.addState(data); 
    } 
  };

  /**
   * [delete delete state]
   * @param  {[type]} state_number [number of the state to be deleted]
   * @return {[type]}              [true if state existed and was deleted, false if state did not exist]
   */
  this.delete = function(state_number){
    if(this.states[state_number]){
      this.states[state_number] = undefined;
      return true;
    }else
      return false;
  };
}

/**
 * [get description]
 * @param  {[type]} state_number [description]
 * @return {[type]}              [description]
 */
StatesService.prototype.get = function(state_number){
  return this.states[state_number];
};


/**
 * [getNodes get state nodes (for state navigator)]
 * @return {[type]} [array of state nodes]
 */
StatesService.prototype.getNodes = function(){
  var nodes = [];

  this.updateStateLevels();

  for (var i in this.states){
    var node = {};
    var state = this.states[i];

    if( state.level !== null && 
        state.type !== 'Z')
    {
      node.id = state.number;
      node.label = state.number + ' ' + state.type;

      var extension_state = this.getExtensionState(state);
      if(extension_state)
        node.label += '\n' + extension_state.number + ' ' + extension_state.type;

      node.level = state.level;
      nodes.push(node);
    }
  }

  return nodes;
};

StatesService.prototype.getEdges = function(){
  var edges = [];

  for (var i in this.states){
    var state = this.states[i];
    
    if(state.states_to){
      state.states_to.forEach( state_to => {
        var edge = {};
        edge.from = state.number;
        edge.to = state_to;
        edges.push(edge);
      });
    }
  }

  return edges;
};

module.exports = StatesService;
