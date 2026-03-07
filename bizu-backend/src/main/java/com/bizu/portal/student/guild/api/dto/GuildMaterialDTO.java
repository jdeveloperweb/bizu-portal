package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildMaterialDTO {
    private UUID id;
    private String title;
    private String type;
    private String uploader;
    private String size;
    private String date;
    private String url;
}
