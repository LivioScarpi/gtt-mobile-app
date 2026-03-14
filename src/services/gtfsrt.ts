// GTFS-RT proto definition for decoding GTT real-time feeds
// Based on https://gtfs.org/realtime/proto/
import protobuf from 'protobufjs';

const gtfsrtProto = `
syntax = "proto2";
package transit_realtime;

message FeedMessage {
  required FeedHeader header = 1;
  repeated FeedEntity entity = 2;
}

message FeedHeader {
  required string gtfs_realtime_version = 1;
  optional uint64 timestamp = 4;
}

message FeedEntity {
  required string id = 1;
  optional TripUpdate trip_update = 3;
  optional VehiclePosition vehicle = 4;
  optional Alert alert = 5;
}

message TripUpdate {
  optional TripDescriptor trip = 1;
  optional VehicleDescriptor vehicle = 3;
  repeated StopTimeUpdate stop_time_update = 2;
  optional uint64 timestamp = 4;

  message StopTimeUpdate {
    optional uint32 stop_sequence = 1;
    optional string stop_id = 4;
    optional StopTimeEvent arrival = 2;
    optional StopTimeEvent departure = 3;
  }
}

message StopTimeEvent {
  optional int32 delay = 1;
  optional int64 time = 2;
}

message VehiclePosition {
  optional TripDescriptor trip = 1;
  optional VehicleDescriptor vehicle = 8;
  optional Position position = 2;
  optional uint32 current_stop_sequence = 3;
  optional string stop_id = 7;
  optional uint64 timestamp = 5;
}

message Position {
  required float latitude = 1;
  required float longitude = 2;
  optional float bearing = 3;
  optional float speed = 5;
}

message TripDescriptor {
  optional string trip_id = 1;
  optional string route_id = 5;
  optional uint32 direction_id = 6;
  optional string start_time = 2;
  optional string start_date = 3;
}

message VehicleDescriptor {
  optional string id = 1;
  optional string label = 2;
  optional string license_plate = 3;
}

message Alert {
  repeated TimeRange active_period = 1;
  repeated EntitySelector informed_entity = 5;
  optional TranslatedString header_text = 10;
  optional TranslatedString description_text = 11;
  optional Cause cause = 6;
  optional Effect effect = 7;

  enum Cause {
    UNKNOWN_CAUSE = 1;
    OTHER_CAUSE = 2;
    TECHNICAL_PROBLEM = 3;
    STRIKE = 4;
    DEMONSTRATION = 5;
    ACCIDENT = 6;
    HOLIDAY = 7;
    WEATHER = 8;
    MAINTENANCE = 9;
    CONSTRUCTION = 10;
    POLICE_ACTIVITY = 11;
    MEDICAL_EMERGENCY = 12;
  }

  enum Effect {
    NO_SERVICE = 1;
    REDUCED_SERVICE = 2;
    SIGNIFICANT_DELAYS = 3;
    DETOUR = 4;
    ADDITIONAL_SERVICE = 5;
    MODIFIED_SERVICE = 6;
    OTHER_EFFECT = 7;
    UNKNOWN_EFFECT = 8;
    STOP_MOVED = 9;
  }
}

message TimeRange {
  optional uint64 start = 1;
  optional uint64 end = 2;
}

message EntitySelector {
  optional string agency_id = 1;
  optional string route_id = 3;
  optional string stop_id = 6;
  optional TripDescriptor trip = 4;
}

message TranslatedString {
  repeated Translation translation = 1;
  message Translation {
    required string text = 1;
    optional string language = 2;
  }
}
`;

let FeedMessage: protobuf.Type | null = null;

function getDecoder(): protobuf.Type {
  if (FeedMessage) return FeedMessage;
  const root = protobuf.parse(gtfsrtProto).root;
  FeedMessage = root.lookupType('transit_realtime.FeedMessage');
  return FeedMessage;
}

export function decodeFeedMessage(buffer: Uint8Array): any {
  const decoder = getDecoder();
  const message = decoder.decode(buffer);
  return decoder.toObject(message, { longs: Number, enums: String, defaults: true });
}
