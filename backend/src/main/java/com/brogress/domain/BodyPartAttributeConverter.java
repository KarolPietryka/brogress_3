package com.brogress.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class BodyPartAttributeConverter implements AttributeConverter<BodyPart, String> {

  @Override
  public String convertToDatabaseColumn(BodyPart attribute) {
    return attribute == null ? null : attribute.toApiValue();
  }

  @Override
  public BodyPart convertToEntityAttribute(String dbData) {
    if (dbData == null) {
      return null;
    }
    return BodyPart.fromPath(dbData);
  }
}
